import checkAuth from "./utils/auth";
import createSingleBooking from "./createSingleBooking";
import createRepeatedBookingMonth from "./createRepeatedBookingMonth";
import createRepeatedBookingWeek from "./createRepeatedBookingWeek";
import createRepeatedBookingYear from "./createRepeatedBookingYear";
import createRepeatedBookingDay from "./createRepeatedBookingDay";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
// import { createServer } from "http";
// import { Server } from "socket.io";
// const httpServer = createServer();
// const io = new Server(httpServer, {
//   cors: {
//     origin:
//       process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"],
//   },
// });

// httpServer.listen(3014);

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
            title: `Foutcode ${data.errorCode}34`,
            text: "De gebruiker is niet in de database gevonden.",
          },
        }),
      };
    }
  };

  const convertMonToSun = (i) => {
    let val;

    if (i == 6) {
      val = 0;
    } else {
      val = +i + 1;
    }
    return val;
  };

  const clashingBookings = [];
  const orConditions = [];
  const dateRanges = [];
  const bookingGroup = uuidv4();

  const checkForOverlappingBookings = async (query) => {
    for (const room of body.details.rooms) {
      await prisma.Booking.findMany({
        where: {
          rooms: {
            some: {
              id: room.id,
            },
          },
          OR: query,
        },
      }).then((booking) => {
        booking.forEach((element) => {
          clashingBookings.push({ ...element, room: room });
        });
      });
    }
  };

  const checkForClashingBookings = async () => {
    if (clashingBookings.length > 0) {
      let clashDates = "";
      let i = 1;
      clashingBookings.map((b) => {
        clashDates += `${b.dateFd}-${b.dateFm}-${b.dateFy} (${b.name})`;
        if (i != clashingBookings.length) {
          clashDates += ", ";
        }
        i++;
      });

      return {
        body: JSON.stringify({
          snackbar: {
            type: "error", //success || error || warning || info
            title: `Foutcode ${data.errorCode}114`,
            text: `De reservering heeft een overlap met ${
              clashingBookings.length == 1
                ? "een bestaande boeking"
                : "bestaande boekingen"
            } op ${clashDates}.`,
          },
        }),
      };
    }
  };

  const excludedDates = [];
  if (body.details.excludedDates && body.details.excludedDates.length != 0) {
    body.details.excludedDates.map((d) => {
      excludedDates.push(new Date(d));
    });
  }

  const checkIfExcluded = (f, t) => {
    let value = false;
    excludedDates.map((ed) => {
      if (isSameDay(f, ed) || isSameDay(t, ed)) {
        value = true;
      }
    });

    return value;
  };

  function addWeekToDate(inputDate) {
    // Split the user input date into year, month, and day
    const [year, month, day] = inputDate.split("-").map(Number);

    // Calculate the new date by adding 7 days
    let newDay = day + 7;
    let newMonth = month;
    let newYear = year;

    // Check if the new day value exceeds the number of days in the current month
    const maxDaysInMonth = getMaxDaysInMonth(year, month);
    if (newDay > maxDaysInMonth) {
      newDay -= maxDaysInMonth;
      newMonth++;

      // Check if the new month exceeds 12 (December), increment the year
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }

    // Format the new date
    const newDate =
      formatWithLeadingZero(newYear) +
      "-" +
      formatWithLeadingZero(newMonth) +
      "-" +
      formatWithLeadingZero(newDay);

    return newDate;
  }

  function getMaxDaysInMonth(year, month) {
    // A function to calculate the maximum number of days in a given month
    switch (month) {
      case 4:
      case 6:
      case 9:
      case 11:
        return 30;
      case 2:
        // Check for leap years (divisible by 4, but not by 100 unless by 400)
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
          ? 29
          : 28;
      default:
        return 31;
    }
  }

  function formatWithLeadingZero(value) {
    // A function to format values with a leading zero if needed
    return value < 10 ? "0" + value : value;
  }

  let response = await checkAuth(data)
    .then(async (result) => {
      //   Check if response contains an error snackbar
      if (result.snackbar && result.snackbar.type == "error") {
        return {
          body: JSON.stringify(result),
        };
      }

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
              title: `Foutcode ${data.errorCode}83`,
              text: "Invoervelden mogen niet leeg zijn.",
            },
          }),
        };
      }

      const fromTimestring = Number(
        `${body.details.dateFrom.replaceAll(
          "-",
          ""
        )}${body.details.timeFrom.replace(":", "")}`
      );

      const toTimestring = Number(
        `${body.details.dateTo.replaceAll(
          "-",
          ""
        )}${body.details.timeTo.replace(":", "")}`
      );

      const repeatEndTimestring = Number(
        `${body.details.repeatOptions.repeatUntil.replaceAll("-", "")}2359`
      );

      let dayToCheck = Number(
        `${body.details.dateFrom.replaceAll(
          "-",
          ""
        )}${body.details.timeFrom.replace(":", "")}`
      );

      // Perform main logic here
      if (!body.details.bookingIsRepeated) {
        return await createSingleBooking(data, body).then((result) => {
          return result;
        });
        // commented code below is complete and working
        // io.emit("progress", 1, 10);
        // orConditions.push({
        //   AND: [
        //     { tsFrom: { lte: "" + fromTimestring } },
        //     { tsTo: { gt: "" + fromTimestring } },
        //   ],
        // });
        // orConditions.push({
        //   AND: [
        //     { tsFrom: { lt: "" + toTimestring } },
        //     { tsTo: { gte: "" + toTimestring } },
        //   ],
        // });
        // orConditions.push({
        //   AND: [
        //     { tsFrom: { gte: "" + fromTimestring } },
        //     { tsTo: { lte: "" + toTimestring } },
        //   ],
        // });

        // await checkForOverlappingBookings(orConditions);
        // io.emit("progress", 3, 10);
        // const clash = await checkForClashingBookings();

        // if (clash && clash.body) {
        //   return clash;
        // }

        // io.emit("progress", 5, 10);

        // await prisma.Booking.create({
        //   data: {
        //     name: body.details.name,
        //     description: body.details.description,
        //     tsFrom: "" + fromTimestring,
        //     dateFd: body.details.dateFrom.slice(8, 10),
        //     dateFm: body.details.dateFrom.slice(5, 7),
        //     dateFy: body.details.dateFrom.slice(0, 4),
        //     dateFh: body.details.timeFrom.slice(0, 2),
        //     dateFi: body.details.timeFrom.slice(3, 5),
        //     tsTo: "" + toTimestring,
        //     dateTd: body.details.dateTo.slice(8, 10),
        //     dateTm: body.details.dateTo.slice(5, 7),
        //     dateTy: body.details.dateTo.slice(0, 4),
        //     dateTh: body.details.timeTo.slice(0, 2),
        //     dateTi: body.details.timeTo.slice(3, 5),
        //     roomsetup: body.details.roomsetup,
        //     bookingGroup: bookingGroup,
        //     pax: "" + body.details.pax, // Leave the quotes here, they're needed to convert it to a string
        //     fullDay: body.details.fullDay,
        //     rooms: {
        //       connect: body.details.rooms.map((room) => ({
        //         id: room.id,
        //       })),
        //     },
        //     assemblee: {
        //       create: body.details.perks.map((perk) => ({
        //         count: perk.count,
        //         assemblee: {
        //           connect: {
        //             id: perk.id,
        //           },
        //         },
        //         assembleeNameBackup: perk.name,
        //       })),
        //     },
        //     persons: {
        //       connect: body.details.persons.map((person) => ({
        //         id: person.id,
        //       })),
        //     },
        //     isExportable: body.details.isExportable,
        //     rssLocation: body.details.rssLocation,
        //   },
        // }).then(async () => {
        //   await prisma.$disconnect();
        // });
        // io.emit("progress", 10, 10);

        // Loop below should be used in repeated Bookings, not this single booking
        // for (let count = 1; count <= 10; count++) {
        //   await new Promise((resolve) => {
        //     setTimeout(() => {
        //       io.emit("progress", count, 37);
        //       resolve();
        //     }, 1000);
        //   });
        // }
      } else {
        if (body.details.repeatOptions.periode.int == 30) {
          return await createRepeatedBookingMonth(data, body).then((result) => {
            return result;
          });
        } else if (body.details.repeatOptions.periode.int == 7) {
          return await createRepeatedBookingWeek(data, body).then((result) => {
            return result;
          });
          // Commented code below works, should be extended
          // while (dayToCheck <= repeatEndTimestring) {
          //   const assembledDate = `${String(dayToCheck).slice(0, 4)}-${String(
          //     dayToCheck
          //   ).slice(4, 6)}-${String(dayToCheck).slice(6, 8)}`;

          //   const newDate = addWeekToDate(assembledDate);
          //   console.log("New date:", newDate);

          //   dayToCheck = Number(`${newDate.replaceAll("-", "")}0000`);
          // }
        } else if (body.details.repeatOptions.periode.int == 365) {
          return await createRepeatedBookingYear(data, body).then((result) => {
            return result;
          });
        } else if (body.details.repeatOptions.periode.int == 1) {
          return await createRepeatedBookingDay(data, body).then((result) => {
            return result;
          });
        } else {
          return {
            body: JSON.stringify({
              snackbar: {
                type: "error", //success || error || warning || info
                title: "Foutcode CBO54",
                text: "Er kon geen boekingsperiode gevonden worden.",
              },
            }),
          };
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
    })
    .catch((error) => {
      console.log("error", error);
      return error;
    });

  return response;
});
