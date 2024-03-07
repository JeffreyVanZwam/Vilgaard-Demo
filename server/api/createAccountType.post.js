import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "CAT",
    rightName: "userManagement_accountTypes_createRole",
    actionName: "create-role",
  };

  const writeActionlog = async () => {
    const performingUserEmail = body.auth.currentUser.email;

    const performingUser = await prisma.User.findUnique({
      where: { email: performingUserEmail },
      select: { id: true },
    });

    if (performingUser) {
      await prisma.ActionLog.create({
        data: {
          actionOfUser: { connect: { id: performingUser.id } },
          performedAction: {
            connect: { name: data.actionName },
          },
        },
      });

      await prisma.$disconnect();
    } else {
      return {
        body: JSON.stringify({
          snackbar: {
            type: "error", //success || error || warning || info
            title: "Foutcode CAT39",
            text: "De gebruiker is niet in de database gevonden.",
          },
        }),
      };
    }
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
      function containsNumbers(str) {
        return /\d/.test(str);
      }

      if (containsNumbers(body.submission.name)) {
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode CAT66",
              text: "De ID bevat niet toegestane leestekens.",
            },
          }),
        };
      }

      if (
        body.submission.backgroundColor == "" ||
        body.submission.textColor == "" ||
        body.submission.display == ""
      ) {
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode CAT82",
              text: "Invoervelden mogen niet leeg zijn.",
            },
          }),
        };
      }

      try {
        await prisma.AccountType.create({
          data: {
            name: body.submission.name.toLowerCase(),
            backgroundColor: body.submission.backgroundColor,
            textColor: body.submission.textColor,
            display: body.submission.display,
            accountRights: {
              connect: body.submission.accountRights.map((right) => ({
                id: right.id,
              })),
            },
          },
        }).then(async () => {
          await prisma.$disconnect();
        });

        await writeActionlog();

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
        await prisma.$disconnect();
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode CAT123",
              text: "De wijzigingen konden niet worden opgeslagen.",
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
