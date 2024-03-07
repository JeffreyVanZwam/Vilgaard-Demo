import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";
import admin from "firebase-admin";
import serviceAccount from "~/server/assets/cmv-vilgaard-firebase-adminsdk-rthru-ddfa31ddc5.json";

// Initialize Firebase Admin SDK
const randomString = Math.floor(Math.random() * 1000);
admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  `admin_DDU_${randomString}`
);

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "DDU",
    rightName: "userManagement_adminAccess_editAdmins",
    actionName: "delete-user",
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
            title: "Foutcode DDU50",
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
              title: "Foutcode DDU80",
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

        await writeActionlog();

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
              title: "Foutcode DDU118",
              text: "Het account kon niet worden verwijderd.",
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
