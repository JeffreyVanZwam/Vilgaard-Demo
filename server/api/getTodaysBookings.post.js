import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "GTB",
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
      //   get todays date
      const todayStart = new Date();
      const todayEnd = new Date();
      todayStart.setHours(0, 0, 0);
      todayEnd.setHours(23, 59, 59);
      const todaySTS = "" + todayStart.getTime();
      const todayETS = "" + todayEnd.getTime();

      try {
        const bookings = await prisma.booking
          .findMany({
            where: {
              rooms: {
                some: {
                  location: {
                    id: body.location.id,
                  },
                },
              },
              OR: [
                {
                  tsFrom: {
                    lte: todayETS,
                  },
                  tsTo: {
                    gte: todaySTS,
                  },
                },
                {
                  tsFrom: {
                    lte: todayETS,
                  },
                  tsTo: {
                    gte: todayETS,
                  },
                },
                {
                  tsFrom: {
                    lte: todaySTS,
                  },
                  tsTo: {
                    gte: todaySTS,
                  },
                },
              ],
            },
            include: {
              rooms: true,
            },
            orderBy: {
              tsFrom: "asc",
            },
          })
          .then(async (res) => {
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
              title: "Foutcode GBO92",
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
