import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  //   get user data from request, use for validation
  const apiKey = body.apiKey;
  const accessToken = body.currentUser.stsTokenManager.accessToken;
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
          title: "Foutcode GLOFCU26",
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
      console.error("error_GLOFCU47", e);
      await prisma.$disconnect();
    });

  // If the emailaddress doesn't exist in the Prisma DB throw an error
  if (!userPrismaAccount) {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode GLOFCU57",
          text: "Dit emailadres is niet bekend in de database.",
        },
      }),
    };
  }

  // Get all locations
  const locations = await prisma.Location.findMany({
    where: {
      accessibleBy: {
        some: {
          email: firebaseAccount.users[0].email,
        },
      },
    },
  })
    .then(async (res) => {
      await prisma.$disconnect();
      return res;
    })
    .catch(async (e) => {
      console.error("error_GLOFCU79", e);
      await prisma.$disconnect();
    });

  return {
    body: JSON.stringify(locations),
  };
});
