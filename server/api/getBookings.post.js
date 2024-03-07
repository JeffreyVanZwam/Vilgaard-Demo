import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "GBO",
    rightName: "calendar_reservationsView_showBookings",
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
      // TODO: consider fetching only for this month, to prevent too big load time
      try {
        const bookings = await prisma.Booking.findMany({
          include: {
            rooms: true,
            assemblee: {
              include: {
                assemblee: true,
              },
            },
            persons: true,
          },
          where: {
            rooms: {
              some: {
                location: {
                  id: body.location.id,
                },
              },
            },
          },
        }).then(async (res) => {
          await prisma.$disconnect();
          return res;
        });

        return {
          body: JSON.stringify(bookings),
        };
      } catch (error) {
        await prisma.$disconnect();
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode GBO59",
              text: "De reserveringen konden niet worden geladen.",
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
