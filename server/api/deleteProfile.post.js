import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";
import serviceAccount from "~/server/assets/cmv-vilgaard-firebase-adminsdk-rthru-ddfa31ddc5.json";

// Initialize Firebase Admin SDK
const randomString = Math.floor(Math.random() * 1000);
admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  `admin_DPR_${randomString}`
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
          title: "Foutcode DPR35",
          text: "Ongeldige API key ingevoerd.",
        },
      }),
    };
  }

  //   Set the userID of the current logged in user
  const userID = firebaseAccount.users[0].localId;

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
      console.error("error_DPR56", e);
      await prisma.$disconnect();
    });

  // If the emailaddress doesn't exist in the Prisma DB throw an error
  if (!userPrismaAccount) {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode DPR66",
          text: "Dit emailadres is niet bekend in de database.",
        },
      }),
    };
  }

  //   check if the input email matches the email from the auth API key
  if (firebaseAccount.users[0].email == body.user.email) {
    //   Delete the user in Firebase
    try {
      await admin.auth().deleteUser(body.user.id);
    } catch (error) {
      let errorMSG = error.message;
      // Return error response
      return {
        status: "error",
        body: JSON.stringify({
          snackbar: {
            type: "error",
            title: "Foutcode DPR86",
            text: errorMSG,
          },
        }),
      };
    }
    try {
      await prisma.actionLog.deleteMany({
        where: { actionOfUser: { id: body.user.id } },
      });
      await prisma.User.delete({
        where: {
          email: body.user.email,
        },
      }).then(async (res) => {
        await prisma.$disconnect();
      });
      return {
        body: JSON.stringify({
          snackbar: {
            type: "success", //success || error || warning || info
            title: "Succes",
            text: `Account '${body.user.email}' is verwijderd.`,
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
            title: "Foutcode DPR119",
            text: "Het account kon niet worden verwijderd.",
          },
        }),
      };
    }
  } else {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode DPR130",
          text: "Het emailadres dat je wilt verwijderen komt niet overeen met het emailadres waarmee je bent ingelogd.",
        },
      }),
    };
  }
});
