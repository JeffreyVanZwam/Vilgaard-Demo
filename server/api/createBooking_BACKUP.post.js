import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";
import { v4 as uuidv4 } from "uuid";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "CBO",
    rightName: "calendar_reservationsView_createBooking",
    actionName: "create-booking",
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
            title: "Foutcode CBO40",
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
      if (
        !body.details ||
        body.details.name == "" ||
        body.details.dateFrom == "" ||
        body.details.dateTo == ""
      ) {
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode CBO68",
              text: "Invoervelden mogen niet leeg zijn.",
            },
          }),
        };
      }

      // Check if the current booking isn't overlapping any existing booking
      const allCurrentBookings = [];
      for (const room of body.details.rooms) {
        await prisma.Booking.findMany({
          where: {
            rooms: {
              some: {
                id: room.id,
              },
            },
          },
        }).then((booking) => {
          booking.forEach((element) => {
            allCurrentBookings.push({ ...element, room: room });
          });
        });
      }

      const thisStartDate = new Date(
        `${body.details.dateFrom.slice(0, 4)}-${body.details.dateFrom.slice(
          5,
          7
        )}-${body.details.dateFrom.slice(8, 10)} ${
          body.details.fullDay ? "00" : body.details.dateFrom.slice(11, 13)
        }:${body.details.fullDay ? "00" : body.details.dateFrom.slice(14, 16)}`
      );
      const thisEndDate = new Date(
        `${body.details.dateTo.slice(0, 4)}-${body.details.dateTo.slice(
          5,
          7
        )}-${body.details.dateTo.slice(8, 10)} ${
          body.details.fullDay ? "00" : body.details.dateTo.slice(11, 13)
        }:${body.details.fullDay ? "00" : body.details.dateTo.slice(14, 16)}`
      );

      const clashingBookings = allCurrentBookings.filter((booking) => {
        const bookingStartDate = new Date(
          `${booking.dateFy}-${booking.dateFm}-${booking.dateFd} ${booking.dateFh}:${booking.dateFi}`
        );
        const bookingEndDate = new Date(
          `${booking.dateTy}-${booking.dateTm}-${booking.dateTd} ${booking.dateTh}:${booking.dateTi}`
        );
        if (
          (thisStartDate >= bookingStartDate &&
            thisStartDate < bookingEndDate) ||
          (thisEndDate > bookingStartDate && thisEndDate <= bookingEndDate) ||
          (thisStartDate < bookingStartDate && thisEndDate > bookingEndDate)
        ) {
          // Overlap detected
          return true;
        }
      });

      if (clashingBookings.length > 0) {
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode CBO107",
              text: "De reservering heeft een overlap met een bestaande boeking.",
            },
          }),
        };
      }

      const fromTS = new Date(thisStartDate).getTime();
      const toTS = new Date(thisEndDate).getTime();
      const repeatUntilTS = new Date(body.details.repeatUntil).getTime();
      const bookingGroup = uuidv4();

      try {
        if (body.details.repeat == 0) {
          // Create only one booking, as the interval is set to 0 (so non-repeating booking)
          await prisma.Booking.create({
            data: {
              name: body.details.name,
              description: body.details.description,
              tsFrom: "" + fromTS,
              dateFd: body.details.dateFrom.slice(8, 10),
              dateFm: body.details.dateFrom.slice(5, 7),
              dateFy: body.details.dateFrom.slice(0, 4),
              dateFh: body.details.fullDay
                ? "00"
                : body.details.dateFrom.slice(11, 13),
              dateFi: body.details.fullDay
                ? "00"
                : body.details.dateFrom.slice(14, 16),
              tsTo: "" + toTS,
              dateTd: body.details.dateTo.slice(8, 10),
              dateTm: body.details.dateTo.slice(5, 7),
              dateTy: body.details.dateTo.slice(0, 4),
              dateTh: body.details.fullDay
                ? "23"
                : body.details.dateTo.slice(11, 13),
              dateTi: body.details.fullDay
                ? "59"
                : body.details.dateTo.slice(14, 16),
              roomsetup: body.details.roomsetup,
              bookingGroup: bookingGroup,
              pax: "" + body.details.pax, // Leave the quotes here, they're needed to convert it to a string
              fullDay: body.details.fullDay,
              rooms: {
                connect: body.details.rooms.map((room) => ({
                  id: room.id,
                })),
              },
              assemblee: {
                create: body.details.perks.map((perk) => ({
                  count: perk.count,
                  assemblee: {
                    connect: {
                      id: perk.id,
                    },
                  },
                  assembleeNameBackup: perk.name,
                })),
              },
              persons: {
                connect: body.details.persons.map((person) => ({
                  id: person.id,
                })),
              },
              isExportable: body.details.isExportable,
              rssLocation: body.details.rssLocation,
            },
          }).then(async () => {
            await prisma.$disconnect();
          });
        } else if (body.details.repeat == 30) {
          // create booking for each month
          let jumpsize = 0;
          const bookingDifference = toTS - fromTS;

          for (let index = fromTS; index < repeatUntilTS; index += jumpsize) {
            const newFrom = new Date(index);
            const newTo = new Date(index + bookingDifference);
            let newMonth = newFrom.getMonth() + 1;
            let newYear = newFrom.getFullYear();
            const fullMonth = new Date(newYear, newMonth, 0);
            const daysInNewMonth = fullMonth.getDate();
            let newFmonth = (newFrom.getMonth() + 1)
              .toString()
              .padStart(2, "0"); // "04"
            let newFday = newFrom.getDate().toString().padStart(2, "0"); // "09"
            let newFyear = newFrom.getFullYear().toString();
            let newTmonth = (newTo.getMonth() + 1).toString().padStart(2, "0"); // "04"
            let newTday = newTo.getDate().toString().padStart(2, "0"); // "09"
            let newTyear = newTo.getFullYear().toString();

            await prisma.Booking.create({
              data: {
                name: body.details.name,
                description: body.details.description,
                tsFrom: "" + index,
                dateFd: newFday,
                dateFm: newFmonth,
                dateFy: newFyear,
                dateFh: body.details.fullDay
                  ? "00"
                  : body.details.dateFrom.slice(11, 13),
                dateFi: body.details.fullDay
                  ? "00"
                  : body.details.dateFrom.slice(14, 16),
                tsTo: "" + (index + bookingDifference),
                dateTd: newTday,
                dateTm: newTmonth,
                dateTy: newTyear,
                dateTh: body.details.fullDay
                  ? "23"
                  : body.details.dateTo.slice(11, 13),
                dateTi: body.details.fullDay
                  ? "59"
                  : body.details.dateTo.slice(14, 16),
                roomsetup: body.details.roomsetup,
                bookingGroup: bookingGroup,
                pax: "" + body.details.pax, // Leave the quotes here, they're needed to convert it to a string
                fullDay: body.details.fullDay,
                rooms: {
                  connect: body.details.rooms.map((room) => ({
                    id: room.id,
                  })),
                },
                assemblee: {
                  create: body.details.perks.map((perk) => ({
                    count: perk.count,
                    assemblee: {
                      connect: {
                        id: perk.id,
                      },
                    },
                    assembleeNameBackup: perk.name,
                  })),
                },
                persons: {
                  connect: body.details.persons.map((person) => ({
                    id: person.id,
                  })),
                },
                isExportable: body.details.isExportable,
                rssLocation: body.details.rssLocation,
              },
            }).then(async () => {
              await prisma.$disconnect();
            });

            jumpsize = daysInNewMonth * 24 * 3600 * 1000;
          }
        } else if (body.details.repeat == 999) {
          // this is a customized interval
          console.log("custom interval");
          console.log(body.details.customRepeat);
        } else {
          const jumpsize = body.details.repeat * 24 * 3600 * 1000;
          const bookingDifference = toTS - fromTS;

          for (let index = fromTS; index < repeatUntilTS; index += jumpsize) {
            const newFrom = new Date(index);
            const newTo = new Date(index + bookingDifference);
            let newFmonth = (newFrom.getMonth() + 1)
              .toString()
              .padStart(2, "0"); // "04"
            let newFday = newFrom.getDate().toString().padStart(2, "0"); // "09"
            let newFyear = newFrom.getFullYear().toString();
            let newTmonth = (newTo.getMonth() + 1).toString().padStart(2, "0"); // "04"
            let newTday = newTo.getDate().toString().padStart(2, "0"); // "09"
            let newTyear = newTo.getFullYear().toString();

            await prisma.Booking.create({
              data: {
                name: body.details.name,
                description: body.details.description,
                tsFrom: "" + index,
                dateFd: newFday,
                dateFm: newFmonth,
                dateFy: newFyear,
                dateFh: body.details.fullDay
                  ? "00"
                  : body.details.dateFrom.slice(11, 13),
                dateFi: body.details.fullDay
                  ? "00"
                  : body.details.dateFrom.slice(14, 16),
                tsTo: "" + (index + bookingDifference),
                dateTd: newTday,
                dateTm: newTmonth,
                dateTy: newTyear,
                dateTh: body.details.fullDay
                  ? "23"
                  : body.details.dateTo.slice(11, 13),
                dateTi: body.details.fullDay
                  ? "59"
                  : body.details.dateTo.slice(14, 16),
                roomsetup: body.details.roomsetup,
                bookingGroup: bookingGroup,
                pax: "" + body.details.pax, // Leave the quotes here, they're needed to convert it to a string
                fullDay: body.details.fullDay,
                rooms: {
                  connect: body.details.rooms.map((room) => ({
                    id: room.id,
                  })),
                },
                assemblee: {
                  create: body.details.perks.map((perk) => ({
                    count: perk.count,
                    assemblee: {
                      connect: {
                        id: perk.id,
                      },
                    },
                    assembleeNameBackup: perk.name,
                  })),
                },
                persons: {
                  connect: body.details.persons.map((person) => ({
                    id: person.id,
                  })),
                },
                isExportable: body.details.isExportable,
                rssLocation: body.details.rssLocation,
              },
            }).then(async () => {
              await prisma.$disconnect();
            });
          }
        }

        await writeActionlog();

        return {
          body: JSON.stringify({
            snackbar: {
              type: "success", //success || error || warning || info
              title: "Succes",
              text: "De reservering is aangemaakt.",
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
              title: "Foutcode CBO371",
              text: "De reservering kon niet worden aangemaakt.",
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
