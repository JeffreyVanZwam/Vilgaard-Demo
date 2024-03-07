import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";
import sgMail from "@sendgrid/mail";
import CryptoJS from "crypto-js";
import admin from "firebase-admin";
import serviceAccount from "~/server/assets/cmv-vilgaard-firebase-adminsdk-rthru-ddfa31ddc5.json";

// Initialize Firebase Admin SDK
const randomString = Math.floor(Math.random() * 1000);
admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  `admin_CDU_${randomString}`
);

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "CDU",
    rightName: "userManagement_adminAccess_createAccount",
    actionName: "create-user",
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
            title: "Foutcode CDU52",
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
      const password = CryptoJS.lib.WordArray.random(16).toString();

      //   call the Firebase REST API to create a new admin user
      let newUserData = null;
      let confirmationLink = null;
      try {
        const userRecord = await admin.auth().createUser({
          email: body.input.email,
          password: password,
        });
        newUserData = userRecord;
        confirmationLink = await admin
          .auth()
          .generateEmailVerificationLink(newUserData.email);
      } catch (error) {
        let errorMSG = "";
        if (error.code === "auth/weak-password") {
          errorMSG = "Het wachtwoord dient uit tenminste 6 tekens te bestaan.";
        } else if (error.code === "auth/invalid-password") {
          errorMSG =
            "Het wachtwoord is ongeldig. Controleer of het uit tenminste 6 tekens bestaat.";
        } else if (error.code === "auth/email-already-exists") {
          errorMSG = "Dit emailadres is al in gebruik.";
        } else if (error.code === "auth/invalid-email") {
          errorMSG = "Het emailadres is van een onjuist formaat.";
        } else if (error.code === "auth/email-already-in-use") {
          errorMSG = "Dit emailadres is al in gebruik.";
        } else {
          errorMSG = error.message;
        }

        // Return error response
        return {
          status: "error",
          body: JSON.stringify({
            snackbar: {
              type: "error",
              title: "Foutcode CDU107",
              text: errorMSG,
            },
          }),
        };
      }

      if (!newUserData) {
        return {
          status: "error",
          body: JSON.stringify({
            snackbar: {
              type: "error",
              title: "Foutcode CDU120",
              text: "Er ging iets mis in het opvragen van de gegevens van de aangemaakte gebruiker.",
            },
          }),
        };
      }

      try {
        await prisma.User.create({
          data: {
            id: newUserData.uid,
            email: newUserData.email,
            accountType: {
              connect: {
                id: body.input.accountType,
              },
            },
            firstname: body.input.firstname,
            lastname: body.input.lastname,
            theme: body.input.theme,
            startpage: "dashboard",
            calendarBaseview: {
              name: "daylist",
              display: "Dagweergave",
              icon: "solar:list-bold-duotone",
            },
          },
        }).then(async (res) => {
          await prisma.$disconnect();
        });

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const htmlContent_confirmation = `<html><body><p>Beste ${body.input.firstname},</p><p>Volg deze link om uw e-mailadres te verifiëren:</p><p><a href="${confirmationLink}">Verifieer email</a></p><p>Als u niet heeft gevraagd dit adres te verifiëren, kunt u deze e-mail negeren.</p><p>Met vriendelijke groet,</p><p>Team Vilgaard</p></body></html>`;
        const htmlContent_creds = `<html><body><p>Beste ${body.input.firstname},</p><p>Er is zojuist een account voor u aangemaakt op het dashboard van de Vilgaard. Hierbij ontvangt u de inloggegevens.</p><p><table><tr><td><b>Email:</b></td><td>${newUserData.email}</td></tr><tr><td><b>Wachtwoord:</b></td><td>${password}</td></tr></table></p><p>Bezoek <a href="${process.env.BASE_URL}">deze link</a> om in te loggen of de applicatie op uw toestel te installeren.</p><p><i>U wordt aangeraden direct na het inloggen uw wachtwoord te wijzigen.</i></p><p>Met vriendelijke groet,</p><p>Team Vilgaard</p></body></html>`;

        const msg_confirmation = {
          to: newUserData.email,
          from: {
            name: "Dashboard de Vilgaard",
            email: process.env.SENDER_EMAIL,
          },
          subject: "Verfifieer uw e-mailadres voor Vilres",
          html: htmlContent_confirmation,
        };

        const msg_creds = {
          to: newUserData.email,
          from: {
            name: "Dashboard de Vilgaard",
            email: process.env.SENDER_EMAIL,
          },
          subject: "Uw inloggegevens voor Vilres",
          html: htmlContent_creds,
        };

        sgMail.send(msg_confirmation);
        sgMail.send(msg_creds);

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
        console.log(error);
        await prisma.$disconnect();
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode CDU193",
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
