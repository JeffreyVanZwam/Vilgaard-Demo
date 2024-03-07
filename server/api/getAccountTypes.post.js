import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body,
    errorCode: "GAT",
    rightName: "userManagement_accountTypes_showRoles",
    actionName: null,
  };

  let response = await checkAuth(data)
    .then(async (result) => {
      //   Check if response contains an error snackbar
      if (result.snackbar && result.snackbar.type == "error") {
        return {
          body: JSON.stringify(result),
        };
      }

      // Perform main logic here
      try {
        const accountTypes = await prisma.AccountType.findMany({
          include: { users: true, accountRights: true },
        }).then(async (res) => {
          await prisma.$disconnect();
          return res;
        });

        return {
          body: JSON.stringify(accountTypes),
        };
      } catch (error) {
        await prisma.$disconnect();
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode GAT42",
              text: "De accounttypes konden niet worden geladen.",
            },
          }),
        };
      }
    })
    .catch((error) => {
      console.log("error", error);
      return error;
    });

  return response;
});
