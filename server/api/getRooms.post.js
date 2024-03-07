import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "GRO",
    rightName: "calendar_roomSettings_showRooms",
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
        const rooms = await prisma.Room.findMany({
          where: {
            locationId: body.location.id,
          },
        }).then(async (res) => {
          await prisma.$disconnect();
          return res;
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
              title: "Foutcode GRO44",
              text: "De zalen konden niet worden geladen.",
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
