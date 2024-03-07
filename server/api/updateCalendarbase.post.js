import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  //   first, get emailaddress of current user
  const apiKey = body.auth.apiKey;
  const accessToken = body.auth.currentUser.stsTokenManager.accessToken;

  const firebaseAccount = await $fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      body: { idToken: accessToken },
    }
  );

  //   then, fetch the user detail from Prisma
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
      console.error("error_UCB30", e);
      await prisma.$disconnect();
    });

  if (!userPrismaAccount) {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode UCB39",
          text: "De gebruiker is niet in de database gevonden.",
        },
      }),
    };
  }

  try {
    await prisma.User.update({
      where: { email: firebaseAccount.users[0].email },
      data: {
        calendarBaseview: body.view,
      },
    }).then(async () => {
      await prisma.$disconnect();
    });

    return {
      body: JSON.stringify({
        snackbar: {
          type: "success", //success || error || warning || info
          text: "De wijzigingen zijn opgeslagen.",
        },
      }),
    };
  } catch (error) {
    await prisma.$disconnect();
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode UCB70",
          text: "De wijzigingen konden niet worden opgeslagen.",
        },
      }),
    };
  }
});
