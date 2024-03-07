import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";
import serviceAccount from "~/server/assets/cmv-vilgaard-firebase-adminsdk-rthru-ddfa31ddc5.json";
import { getNewAccessToken } from "./refreshToken";
import { getRefreshToken } from "./userSession";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
    },
    "base"
  );
}

const checkAuth = (data) => {
  const prisma = new PrismaClient();

  return new Promise(async (resolve, reject) => {
    const apiKey = data.auth.apiKey;
    const accessToken = data.auth.currentUser.stsTokenManager.accessToken;
    const userId = data.auth.currentUser.uid;
    const errorCode = `AC${data.errorCode}`; // AC is added to the code (Account Check), to distinct the codes thrown here from the codes thrown in the specific server code.
    let firebaseAccount = null;

    // If the access token is close to expiry or expired, refresh it using the refresh token
    const tokenInfo = await admin.auth().verifyIdToken(accessToken);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (tokenInfo.exp - nowInSeconds < 60) {
      // Token is about to expire or already expired
      const refreshToken = getRefreshToken(userId);

      if (!storedRefreshToken) {
        throw new Error("Stored refresh token not found.");
      }

      const newAccessToken = await getNewAccessToken(refreshToken);

      // Use the new access token to interact with Firebase services
      firebaseAccount = await $fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: "POST",
          body: { idToken: newAccessToken },
        }
      );
    } else {
      // Use the existing access token to interact with Firebase services
      firebaseAccount = await $fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: "POST",
          body: { idToken: accessToken },
        }
      );
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
        await prisma.$disconnect();
        return resolve({
          snackbar: {
            type: "error", //success || error || warning || info
            title: `Foutcode ${errorCode}82`,
            text: e,
          },
        });
      });

    // If the emailaddress doesn't exist in the Prisma DB throw an error
    if (!userPrismaAccount) {
      return resolve({
        snackbar: {
          type: "error", //success || error || warning || info
          title: `Foutcode ${errorCode}93`,
          text: "Dit emailadres is niet bekend in de database.",
        },
      });
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
        await prisma.$disconnect();
        return resolve({
          snackbar: {
            type: "error", //success || error || warning || info
            title: `Foutcode ${errorCode}117`,
            text: e,
          },
        });
      });

    // If the accountrights doesn't exist in the Prisma DB throw an error
    if (!accountRights) {
      return resolve({
        snackbar: {
          type: "error", //success || error || warning || info
          title: `Foutcode ${errorCode}128`,
          text: "De accountrechten konden niet worden geladen.",
        },
      });
    }

    //Cycle through the user's rights and check if the permission exist
    let hasTheRight = false;
    accountRights.accountRights.map((right) => {
      if (right.name == data.rightName) {
        hasTheRight = true;
      }
    });

    if (!hasTheRight) {
      return resolve({
        snackbar: {
          type: "error", //success || error || warning || info
          title: `Foutcode ${errorCode}146`,
          text: "Je hebt onvoldoende rechten om deze actie uit te voeren.",
        },
      });
    }

    return resolve(true);
  });
};

export default checkAuth;
