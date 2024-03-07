import { PrismaClient } from "@prisma/client";
import sgMail from "@sendgrid/mail";

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
          title: "Foutcode UPR26",
          text: "Ongeldige API key ingevoerd.",
        },
      }),
    };
  }

  //   check if the user email exists in the database
  const userPrismaAccount = await prisma.User.findUnique({
    where: {
      email: body.currentUser.email,
    },
  })
    .then(async (res) => {
      await prisma.$disconnect();
      return res;
    })
    .catch(async (e) => {
      console.error("error_UPR44", e);
      await prisma.$disconnect();
    });

  // If the emailaddress doesn't exist in the Prisma DB throw an error
  if (!userPrismaAccount) {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode UPR54",
          text: "De gebruiker is niet in de database gevonden.",
        },
      }),
    };
  }

  const userEmail = body.currentUser.email;
  const loginActionName = "user-change-own-email";

  const user = await prisma.User.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });

  // update all data in Prisma
  try {
    await prisma.User.update({
      where: { email: body.currentUser.email },
      data: {
        email: body.submission.email,
        firstname: body.submission.firstname,
        lastname: body.submission.lastname,
      },
    }).then(async () => {
      await prisma.$disconnect();
    });

    if (body.currentUser.email != body.submission.email) {
      if (user) {
        await prisma.ActionLog.create({
          data: {
            actionOfUser: { connect: { id: user.id } },
            performedAction: { connect: { name: loginActionName } },
          },
        });
      } else {
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode UPR96",
              text: "De gebruiker is niet in de database gevonden.",
            },
          }),
        };
      }

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
          title: "Foutcode UPR144",
          text: "De wijzigingen konden niet worden opgeslagen.",
        },
      }),
    };
  }
});
