import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";
import { zonedTimeToUtc } from "date-fns-tz";
import { setMilliseconds, setSeconds, getTime } from "date-fns";
// import { createServer } from "http";
// import { Server } from "socket.io";
// const httpServer = createServer();
// const io = new Server(httpServer, {
//   cors: {
//     origin:
//       process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"],
//   },
// });

// httpServer.listen(3015);

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "RWTF",
    rightName: "calendar_reservationsView_editBooking",
    actionName: "edit-booking",
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

      try {
        const involvedBookings = await prisma.booking.findMany();
        const lastCheck = await prisma.DBSettings.findUnique({
          where: {
            id: 1,
          },
        });
        const lastID = lastCheck ? lastCheck.lastRewrittenID : 0;
        console.log(lastCheck);
        const batchSize = 10;
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const delayBetweenUpdates = 1000; // Adjust the delay as needed (in milliseconds)

        for (let i = lastID; i < involvedBookings.length; i += batchSize) {
          const batch = involvedBookings.slice(i, i + batchSize);
          // io.emit("progress", i, involvedBookings.length, lastID);
          // console.log(`${i} van de ${involvedBookings.length} gecontroleerd.`);

          await Promise.all(
            batch.map(async (booking) => {
              let thisStartDate = zonedTimeToUtc(
                `${booking.dateFy}-${booking.dateFm}-${booking.dateFd} ${booking.dateFh}:${booking.dateFi}`,
                "Europe/Amsterdam"
              );
              thisStartDate = setSeconds(thisStartDate, 0);
              thisStartDate = setMilliseconds(thisStartDate, 0);

              const fromTS = String(getTime(thisStartDate));

              let thisEndDate = zonedTimeToUtc(
                `${booking.dateTy}-${booking.dateTm}-${booking.dateTd} ${booking.dateTh}:${booking.dateTi}`,
                "Europe/Amsterdam"
              );
              thisEndDate = setSeconds(thisEndDate, 0);
              thisEndDate = setMilliseconds(thisEndDate, 0);

              const toTS = String(getTime(thisEndDate));

              await prisma.booking
                .update({
                  where: {
                    id: booking.id,
                  },
                  data: {
                    tsFrom: fromTS,
                    tsTo: toTS,
                  },
                })
                .then(async () => {
                  await prisma.$disconnect();
                });

              // Introduce a delay between updates
              await delay(delayBetweenUpdates);
            })
          );
        }

        const newValue = involvedBookings.length - 60;

        await prisma.DBSettings.update({
          where: {
            id: 1,
          },
          data: {
            lastRewrittenID: newValue,
          },
        });

        console.log("Controle voltooid");

        // Disconnect after all updates are done
        await prisma.$disconnect();

        return {
          body: JSON.stringify({
            snackbar: {
              type: "success", //success || error || warning || info
              title: "Succes",
              text: "Controle voltooid.",
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
              title: "Foutcode RWTF100",
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
