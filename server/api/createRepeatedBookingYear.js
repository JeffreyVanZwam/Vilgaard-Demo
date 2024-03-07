import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import {
  getTime,
  isSameDay,
  isBefore,
  addMilliseconds,
  getDate,
  getMonth,
  getYear,
  setSeconds,
  setMilliseconds,
  setHours,
  setMinutes,
  addYears,
} from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

const createRepeatedBookingYear = (data, body) => {
  return new Promise(async (resolve, reject) => {
    const prisma = new PrismaClient();
    const bookingGroup = uuidv4();

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
              title: "Foutcode CRBY48",
              text: "De gebruiker is niet in de database gevonden.",
            },
          }),
        };
      }
    };

    const clashingBookings = [];

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

    if (
      !body.details ||
      body.details.name == "" ||
      body.details.dateFrom == "" ||
      body.details.dateTo == ""
    ) {
      return resolve({
        body: JSON.stringify({
          snackbar: {
            type: "error", //success || error || warning || info
            title: "Foutcode CRBY105",
            text: "Invoervelden mogen niet leeg zijn.",
          },
        }),
      });
    }

    const bookingStart = zonedTimeToUtc(
      `${body.details.dateFrom} ${body.details.timeFrom}`,
      "Europe/Amsterdam"
    );
    setSeconds(bookingStart, 0);
    setMilliseconds(bookingStart, 0);

    const bookingStartTS = String(getTime(bookingStart));

    const bookingEnd = zonedTimeToUtc(
      `${body.details.dateTo} ${body.details.timeTo}`,
      "Europe/Amsterdam"
    );
    setSeconds(bookingEnd, 0);
    setMilliseconds(bookingEnd, 0);

    const bookingEndTS = String(getTime(bookingEnd));

    const repeatEnd = zonedTimeToUtc(
      body.details.repeatOptions.repeatUntil,
      "Europe/Amsterdam"
    );

    setHours(repeatEnd, 23);
    setMinutes(repeatEnd, 59);
    setSeconds(repeatEnd, 59);
    setMilliseconds(repeatEnd, 999);

    const bookingDifference = bookingEndTS - bookingStartTS;
    let dayToCheck = zonedTimeToUtc(
      `${body.details.dateFrom} ${body.details.timeFrom}`,
      "Europe/Amsterdam"
    );

    const orConditions = [];
    const dateRanges = [];

    try {
      while (
        isSameDay(dayToCheck, repeatEnd) ||
        isBefore(dayToCheck, repeatEnd)
      ) {
        const newFrom = new Date(dayToCheck);
        const newTo = addMilliseconds(newFrom, bookingDifference);

        const shouldBeExcluded = checkIfExcluded(newFrom, newTo);

        if (!shouldBeExcluded) {
          dateRanges.push({
            fromTS: getTime(newFrom),
            toTS: getTime(newTo),
          });
        }

        dayToCheck = addYears(dayToCheck, body.details.repeatOptions.interval);
      }

      // Loop through each date range
      dateRanges.forEach((dateRange) => {
        // Extract fromTS and toTS from the current date range
        const { fromTS, toTS } = dateRange;

        // Push into the OR conditions array
        orConditions.push({
          AND: [
            { tsFrom: { lte: "" + fromTS } },
            { tsTo: { gt: "" + fromTS } },
          ],
        });
        orConditions.push({
          AND: [{ tsFrom: { lt: "" + toTS } }, { tsTo: { gte: "" + toTS } }],
        });
        orConditions.push({
          AND: [{ tsFrom: { gte: "" + fromTS } }, { tsTo: { lte: "" + toTS } }],
        });
      });

      await checkForOverlappingBookings(orConditions);

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

        return resolve({
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode CRBY206",
              text: `De reservering heeft een overlap met ${
                clashingBookings.length == 1
                  ? "een bestaande boeking"
                  : "bestaande boekingen"
              } op ${clashDates}.`,
            },
          }),
        });
      }
      await (async () => {
        for (const dateRange of dateRanges) {
          const { fromTS, toTS } = dateRange;

          const newFrom = utcToZonedTime(fromTS, "Europe/Amsterdam");
          const newTo = utcToZonedTime(toTS, "Europe/Amsterdam");

          let newFday = getDate(newFrom);
          let newFmonth = getMonth(newFrom) + 1;
          let newFyear = getYear(newFrom);
          let newTday = getDate(newTo);
          let newTmonth = getMonth(newTo) + 1;
          let newTyear = getYear(newTo);

          // create the booking
          await prisma.Booking.create({
            data: {
              name: body.details.name,
              description: body.details.description,
              tsFrom: "" + fromTS,
              dateFd: `${String(newFday).padStart(2, "0")}`,
              dateFm: `${String(newFmonth).padStart(2, "0")}`,
              dateFy: "" + newFyear,
              dateFh: body.details.timeFrom.slice(0, 2),
              dateFi: body.details.timeFrom.slice(3, 5),
              tsTo: "" + toTS,
              dateTd: `${String(newTday).padStart(2, "0")}`,
              dateTm: `${String(newTmonth).padStart(2, "0")}`,
              dateTy: "" + newTyear,
              dateTh: body.details.timeTo.slice(0, 2),
              dateTi: body.details.timeTo.slice(3, 5),
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

          // Pause the loop
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      })();

      await writeActionlog();

      return resolve({
        body: JSON.stringify({
          snackbar: {
            type: "success", //success || error || warning || info
            title: "Succes",
            text: "De reserveringen zijn aangemaakt.",
          },
        }),
      });
    } catch (error) {
      console.log(error);
      await prisma.$disconnect();
      return {
        body: JSON.stringify({
          snackbar: {
            type: "error", //success || error || warning || info
            title: "Foutcode CRBY302",
            text: "De reservering kon niet worden aangemaakt.",
          },
        }),
      };
    }
  });
};

export default createRepeatedBookingYear;
