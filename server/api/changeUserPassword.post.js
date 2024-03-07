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
  `admin_CUP_${randomString}`
);

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "CUP",
    rightName: "userManagement_adminAccess_editAdmins",
    actionNameForPerforming: "admin-changes-user-password",
    actionNameForAffected: "user-password-changed-by-admin",
  };

  const writeActionlog = async () => {
    const performingUserEmail = body.auth.currentUser.email;
    const affectedUserEmail = body.user.email;

    const performingUser = await prisma.User.findUnique({
      where: { email: performingUserEmail },
      select: { id: true },
    });

    const affectedUser = await prisma.User.findUnique({
      where: { email: affectedUserEmail },
      select: { id: true },
    });

    if (performingUser && affectedUser) {
      await prisma.ActionLog.create({
        data: {
          actionOfUser: { connect: { id: performingUser.id } },
          performedAction: {
            connect: { name: data.actionNameForPerforming },
          },
        },
      });

      await prisma.ActionLog.create({
        data: {
          actionOfUser: { connect: { id: affectedUser.id } },
          performedAction: {
            connect: { name: data.actionNameForAffected },
          },
        },
      });

      await prisma.$disconnect();
    } else {
      return {
        body: JSON.stringify({
          snackbar: {
            type: "error", //success || error || warning || info
            title: `Foutcode ${data.errorCode}66`,
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
      try {
        await admin.auth().updateUser(body.user.id, {
          password: body.input,
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
        let errorMSG = "";
        if (error.code === "auth/invalid-password") {
          errorMSG =
            "Het wachtwoord dient uit minstens 6 geldigde tekens te bestaan.";
        } else {
          errorMSG = error.message;
        }

        return {
          status: "error",
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: `Foutcode ${data.errorCode}115`,
              text: errorMSG,
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
