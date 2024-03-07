import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  //   first, get emailaddress of current user
  const apiKey = body.apiKey;
  const accessToken = body.currentUser.stsTokenManager.accessToken;

  const firebaseAccount = await $fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      body: { idToken: accessToken },
    }
  );

  const data = await prisma.User.findUnique({
    where: {
      email: firebaseAccount.users[0].email,
    },
    select: {
      theme: true,
      accountType: {
        include: {
          accountRights: true,
        },
      },
      firstname: true,
      lastname: true,
      startpage: true,
      calendarBaseview: true,
      idleDuration: true,
    },
  }).then(async (res) => {
    await prisma.$disconnect();
    return res;
  });

  if (!data) {
    await prisma.$disconnect();
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode GTH45",
          text: "De gebruikers instellingen konden niet worden geladen.",
        },
      }),
    };
  } else {
    return {
      body: JSON.stringify(data),
    };
  }
});
