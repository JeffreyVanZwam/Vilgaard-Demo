import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "GAR",
    rightName: "calendar_reservationsView_crossLocation",
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
        const rooms = await prisma.User.findUnique({
          where: {
            id: body.auth.currentUser.uid,
          },
          select: {
            canSeeLocations: {
              include: {
                rooms: true,
              },
            },
          },
        }).then(async (res) => {
          await prisma.$disconnect();
          return res.canSeeLocations;
        });

        return {
          body: JSON.stringify(rooms),
        };
      } catch (error) {
        await prisma.$disconnect();
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode GAR51",
              text: "De locaties en zalen konden niet worden geladen.",
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
