import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "UATR",
    rightName: "userManagement_accountTypes_editRole",
    actionName: "edit-role",
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
            title: "Foutcode UATR39",
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

      // Else perform main logic here
      function containsNumbers(str) {
        return /\d/.test(str);
      }

      if (containsNumbers(body.submission.name)) {
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode UATR66",
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
              title: "Foutcode UATR82",
              text: "Invoervelden mogen niet leeg zijn.",
            },
          }),
        };
      }

      try {
        await prisma.AccountType.update({
          where: { id: body.submission.id },
          data: {
            name: body.submission.name,
            backgroundColor: body.submission.backgroundColor,
            textColor: body.submission.textColor,
            display: body.submission.display,
            accountRights: {
              set: body.submission.accountRights.map((right) => ({
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
              title: "Foutcode UATR124",
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
