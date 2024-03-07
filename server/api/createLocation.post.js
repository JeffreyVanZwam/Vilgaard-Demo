import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "CLO",
    rightName: "generalSettings_locations_createLocation",
    actionName: "create-location",
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
            title: "Foutcode CLO40",
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
      if (body.location == "") {
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode CLO62",
              text: "Invoervelden mogen niet leeg zijn.",
            },
          }),
        };
      }

      try {
        await prisma.Location.create({
          data: {
            name: body.location,
            visibleInFeed: {
              connect: body.feeds.map((f) => ({
                id: f.id,
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
              text: "De locatie is toegevoegd. De app wordt herstart. Een ogenblik aub.",
            },
          }),
        };
      } catch (error) {
        await prisma.$disconnect();
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode CLO100",
              text: "De locatie kon niet worden aangemaakt.",
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
