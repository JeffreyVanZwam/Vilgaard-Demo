import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "DBO",
    rightName: "calendar_reservationsView_deleteBooking",
    actionName: "delete-booking",
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
            title: "Foutcode DBO39",
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
      const thisStartDate = new Date(
        `${body.booking.dateFy}-${body.booking.dateFm}-${body.booking.dateFd} ${
          body.booking.fullDay ? "00" : body.booking.dateFh
        }:${body.booking.fullDay ? "00" : body.booking.dateFi}`
      );
      const fromTS = new Date(thisStartDate).getTime();

      try {
        if (body.type == "single" || body.type == "deleteCurrent") {
          await prisma.AssembleeSpecs.deleteMany({
            where: {
              bookingId: body.booking.id,
            },
          }).then(async () => {
            await prisma.$disconnect();
          });

          await prisma.Booking.delete({
            where: {
              id: body.booking.id,
            },
          }).then(async () => {
            await prisma.$disconnect();
          });
        } else if (body.type == "deleteCurrentAndNext") {
          // first get all bookings that are involved
          const involvedBookings = await prisma.booking.findMany({
            where: {
              bookingGroup: body.booking.bookingGroup,
              tsFrom: {
                gte: "" + fromTS,
              },
            },
          });
          await (async () => {
            for (const ib of involvedBookings) {
              await prisma.AssembleeSpecs.deleteMany({
                where: {
                  bookingId: ib.id,
                },
              }).then(async () => {
                await prisma.$disconnect();
              });

              await prisma.Booking.delete({
                where: {
                  id: ib.id,
                },
              }).then(async () => {
                await prisma.$disconnect();
              });
            }
          })();
        } else if (body.type == "deleteAll") {
          // first get all bookings that are involved
          const involvedBookings = await prisma.booking.findMany({
            where: {
              bookingGroup: body.booking.bookingGroup,
            },
          });

          await (async () => {
            for (const ib of involvedBookings) {
              await prisma.AssembleeSpecs.deleteMany({
                where: {
                  bookingId: ib.id,
                },
              }).then(async () => {
                await prisma.$disconnect();
              });

              await prisma.Booking.delete({
                where: {
                  id: ib.id,
                },
              }).then(async () => {
                await prisma.$disconnect();
              });
            }
          })();
        } else {
          await prisma.$disconnect();
          return {
            body: JSON.stringify({
              snackbar: {
                type: "error", //success || error || warning || info
                title: "Foutcode DBO140",
                text: "Het verwijderen is niet gelukt. Er kon niet bepaald worden welke boekingen uit de reeks verwijderd moesten worden.",
              },
            }),
          };
        }

        await writeActionlog();

        return {
          body: JSON.stringify({
            snackbar: {
              type: "success", //success || error || warning || info
              title: "Succes",
              text: `Reservering verwijderd`,
            },
          }),
        };
      } catch (error) {
        await prisma.$disconnect();
        console.log(error);
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode DBO165",
              text: "De reservering kon niet verwijderd worden.",
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
