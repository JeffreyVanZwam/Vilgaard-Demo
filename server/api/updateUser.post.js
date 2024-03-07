import { PrismaClient } from "@prisma/client";
import sgMail from "@sendgrid/mail";

import admin from "firebase-admin";
import serviceAccount from "~/server/assets/cmv-vilgaard-firebase-adminsdk-rthru-ddfa31ddc5.json";
admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  "admin"
);

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  //   get user data from request, use for validation
  const apiKey = body.auth.apiKey;
  const accessToken = body.auth.currentUser.stsTokenManager.accessToken;
  let firebaseAccount = null;

  //   try to connect to firebase and see if provided API key is valid.
  try {
    firebaseAccount = await $fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        body: { idToken: accessToken },
      }
    );
  } catch (error) {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode UUS36",
          text: "Ongeldige API key ingevoerd.",
        },
      }),
    };
  }

  //   check if the user email exists in the database
  const userPrismaAccount = await prisma.User.findUnique({
    where: {
      email: firebaseAccount.users[0].email,
    },
  })
    .then(async (res) => {
      await prisma.$disconnect();
      return res;
    })
    .catch(async (e) => {
      console.error("error_UUS54", e);
      await prisma.$disconnect();
    });

  // If the emailaddress doesn't exist in the Prisma DB throw an error
  if (!userPrismaAccount) {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode UUS64",
          text: "De gebruiker is niet in de database gevonden.",
        },
      }),
    };
  }

  // Get all the accountrights for the users accounttype
  const accountRights = await prisma.AccountType.findUnique({
    where: {
      id: userPrismaAccount.accountTypeId,
    },
    include: {
      accountRights: true,
    },
  })
    .then(async (res) => {
      await prisma.$disconnect();
      return res;
    })
    .catch(async (e) => {
      console.error("error_UUS85", e);
      await prisma.$disconnect();
    });

  // If the accountrights doesn't exist in the Prisma DB throw an error
  if (!accountRights) {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode UUS95",
          text: "De accountrechten konden niet worden geladen.",
        },
      }),
    };
  }

  //Cycle through the user's rights and check if the permission exist
  let hasTheRight = false;
  accountRights.accountRights.map((right) => {
    if (right.name == "userManagement_adminAccess_editAdmins") {
      hasTheRight = true;
    }
  });

  if (!hasTheRight) {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode UUS115",
          text: "Je hebt onvoldoende rechten om deze actie uit te voeren.",
        },
      }),
    };
  }

  //   if the emailaddress' changed, update Firebase and inform the user by email

  if (body.currentUser.email != body.submission.email) {
    //   First, update the emailaddress in Firebase
    try {
      await admin.auth().updateUser(body.submission.id, {
        email: body.submission.email,
      });
    } catch (error) {
      console.log(error);
      let errorMSG = "";
      if (error.code === "auth/email-already-exists") {
        errorMSG = "Dit emailadres is al in gebruik.";
      } else if (error.code === "auth/invalid-email") {
        errorMSG = "Het emailadres is van een onjuist formaat.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMSG = "Dit emailadres is al in gebruik.";
      } else if (error.code === "auth/user-not-found") {
        errorMSG =
          "Er is geen gebruiker gevonden horend bij de opgegeven identifier.";
      } else {
        errorMSG = error.message;
      }

      // Return error response
      return {
        status: "error",
        body: JSON.stringify({
          snackbar: {
            type: "error",
            title: "Foutcode UUS152",
            text: errorMSG,
          },
        }),
      };
    }
  }

  // Second, update all data in Prisma
  try {
    await prisma.User.update({
      where: { email: body.currentUser.email },
      data: {
        email: body.submission.email,
        accountType: {
          connect: {
            id: body.submission.role.id,
          },
        },
        firstname: body.submission.firstname,
        lastname: body.submission.lastname,
      },
    }).then(async (res) => {
      await prisma.$disconnect();
    });

    if (body.currentUser.email != body.submission.email) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const htmlContent_confirmation = `<html><body><p>Beste ${
        body.submission.firstname
          ? body.submission.firstname
          : "dashboard gebruiker"
      },</p><p>Zojuist is dit emailadres (${
        body.currentUser.email
      }) gewijzigd.</p><p>Met dit emailadres heeft u toegang tot het dashboard. Het is daarom belangrijk dat uw emailadres klopt. Het nieuwe emailadres waarmee u nu toegang heeft is ${
        body.submission.email
      }.</p><p>Neem contact op met de beheerder als u deze wijziging niet zelf heeft doorgevoerd of indien gegevens onjuist zijn.</p><p>Met vriendelijke groet,</p><p>Team Vilgaard</p></body></html>`;

      const msg_confirmation = {
        to: body.currentUser.email,
        from: {
          name: "Dashboard de Vilgaard",
          email: process.env.SENDER_EMAIL,
        },
        subject: "Uw e-mailadres voor Vilres is gewijzigd",
        html: htmlContent_confirmation,
      };

      sgMail.send(msg_confirmation);
    }

    return {
      body: JSON.stringify({
        snackbar: {
          type: "success", //success || error || warning || info
          title: "Succes",
          text: "De wijzigingen zijn opgeslagen.",
        },
      }),
    };
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode UUS220",
          text: "De wijzigingen konden niet worden opgeslagen.",
        },
      }),
    };
  }
});
