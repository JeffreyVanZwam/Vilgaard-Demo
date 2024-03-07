import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";
import dayjs from "dayjs";
import "dayjs/locale/nl";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "FETS",
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
        const batchSize = 10;
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const delayBetweenUpdates = 1000; // Adjust the delay as needed (in milliseconds)

        for (let i = 4350; i < involvedBookings.length; i += batchSize) {
          const batch = involvedBookings.slice(i, i + batchSize);
          console.log(`${i} van de ${involvedBookings.length} gecontroleerd.`);

          await Promise.all(
            batch.map(async (booking) => {
              const thisStartDate = dayjs(
                `${booking.dateFy}-${booking.dateFm}-${booking.dateFd} ${booking.dateFh}:${booking.dateFi}`,
                "YYYY-MM-DD HH:mm",
                "nl"
              )
                .set("second", 0)
                .set("millisecond", 0)
                .locale("nl");

              const fromTS = "" + thisStartDate.valueOf();

              const thisEndDate = dayjs(
                `${booking.dateTy}-${booking.dateTm}-${booking.dateTd} ${booking.dateTh}:${booking.dateTi}`,
                "YYYY-MM-DD HH:mm",
                "nl"
              )
                .set("second", 0)
                .set("millisecond", 0)
                .locale("nl");

              const toTS = "" + thisEndDate.valueOf();

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

        console.log("Controle voltooid");

        // Disconnect after all updates are done
        await prisma.$disconnect();

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
              title: "Foutcode UBO607",
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
