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
      console.error("error_GME30", e);
      await prisma.$disconnect();
    });

  if (!userPrismaAccount) {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode GME39",
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
      console.error("error_GME60", e);
      await prisma.$disconnect();
    });

  // If the accountrights doesn't exist in the Prisma DB throw an error
  if (!accountRights) {
    return {
      body: JSON.stringify({
        snackbar: {
          type: "error", //success || error || warning || info
          title: "Foutcode GME70",
          text: "De accountrechten konden niet worden geladen.",
        },
      }),
    };
  }

  // Get the full menu and strip items that doesn't contain rights on pageItems
  const fullMenu = await prisma.MenuItem.findMany({
    include: {
      subMenu: {
        include: {
          pageItems: true,
        },
        where: {
          pageItems: { some: {} },
        },
      },
      pageItems: true,
    },
    where: {
      OR: [
        { subMenu: { some: { pageItems: { some: {} } } } },
        { pageItems: { some: {} } },
        { id: 1 }, // id 1 = dashboard, this link should always be visible, even if it doesn't contain pageItems.
      ],
    },
  })
    .then(async (res) => {
      await prisma.$disconnect();
      return res;
    })
    .catch(async (e) => {
      console.error("error_GME103", e);
      await prisma.$disconnect();
    });

  const calcSubmenuAccess = (menuItem) => {
    // check if the item exists in the access list
    let i = 0;
    menuItem.pageItems.forEach((item) => {
      accountRights.accountRights.map((r) => {
        if (r.id == item.id) i++;
      });
    });
    return i > 0;
  };

  // Loop through menu items and see if the user is allowed to see this item
  let filteredMenu = await fullMenu.filter((menuItem) => {
    let value = false;
    let i = 0;
    if (menuItem.id == 1) {
      return true;
    } else {
      if (menuItem.subMenu && menuItem.subMenu.length != 0) {
        menuItem.subMenu.forEach((item) => {
          value = calcSubmenuAccess(item);
          if (value) i++;
        });
      } else {
        value = calcSubmenuAccess(menuItem);
        if (value) i++;
      }
      return i > 0;
    }
  });

  return {
    body: JSON.stringify(filteredMenu),
  };
});
