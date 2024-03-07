import { PrismaClient } from "@prisma/client";

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
          title: "Foutcode PLO26",
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
      console.error("error_PLO44", e);
      await prisma.$disconnect();
    });

  // If the emailaddress doesn't exist in the Prisma DB throw an error
  if (!userPrismaAccount) {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode PLO54",
          text: "De gebruiker is niet in de database gevonden.",
        },
      }),
    };
  }

  const userEmail = firebaseAccount.users[0].email;
  const userLastRefreshAt = firebaseAccount.users[0].lastRefreshAt;
  const loginActionName = "user-login";

  const user = await prisma.User.findUnique({
    where: { email: userEmail },
    select: { id: true, startpage: true },
  });

  try {
    if (user) {
      const createActionLog = await prisma.ActionLog.create({
        data: {
          actionOfUser: { connect: { id: user.id } },
          performedAction: { connect: { name: loginActionName } },
        },
      });

      await prisma.User.update({
        where: { id: user.id },
        data: {
          lastLogin: userLastRefreshAt,
          actionLog: { connect: { id: createActionLog.id } },
        },
      });
    } else {
      return {
        body: JSON.stringify({
          snackbar: {
            type: "error", //success || error || warning || info
            title: "Foutcode PLO91",
            text: "De gebruiker is niet in de database gevonden.",
          },
        }),
      };
    }
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
  }

  return {
    body: JSON.stringify({
      startpage: user.startpage,
    }),
  };
});
