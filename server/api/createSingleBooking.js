import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { getTime } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

const createSingleBooking = (data, body) => {
  return new Promise(async (resolve, reject) => {
    const prisma = new PrismaClient();

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
              title: "Foutcode CSB34",
              text: "De gebruiker is niet in de database gevonden.",
            },
          }),
        };
      }
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
            title: "Foutcode CSB53",
            text: "Invoervelden mogen niet leeg zijn.",
          },
        }),
      });
    }

    const utcStartDate = zonedTimeToUtc(
      `${body.details.dateFrom} ${body.details.timeFrom}`,
      "Europe/Amsterdam"
    );
    const utcFromTS = String(getTime(utcStartDate));

    const utcEndDate = zonedTimeToUtc(
      `${body.details.dateTo} ${body.details.timeTo}`,
      "Europe/Amsterdam"
    );
    const utcToTS = String(getTime(utcEndDate));

    // Check if the current booking isn't overlapping any existing booking
    const clashingBookings = [];
    for (const room of body.details.rooms) {
      await prisma.Booking.findMany({
        where: {
          rooms: {
            some: {
              id: room.id,
            },
          },
          OR: [
            {
              AND: [
                { tsFrom: { lte: utcFromTS } }, // Check if the booking's end is after or at the same time as utcFromTS
                { tsTo: { gt: utcFromTS } }, // Check if the booking's start is before or at the same time as utcFromTS
              ],
            },
            {
              AND: [
                { tsFrom: { lt: utcToTS } }, // Check if the booking's end is after or at the same time as utcToTS
                { tsTo: { gte: utcToTS } }, // Check if the booking's start is before or at the same time as utcToTS
              ],
            },
            {
              AND: [
                { tsFrom: { gte: utcFromTS } }, // Check if the booking's start is after or at the same time as utcFromTS
                { tsTo: { lte: utcToTS } }, // Check if the booking's end is before or at the same time as utcToTS
              ],
            },
          ],
        },
      }).then((booking) => {
        booking.forEach((element) => {
          clashingBookings.push({ ...element, room: room });
        });
      });
    }

    if (clashingBookings.length > 0) {
      return resolve({
        body: JSON.stringify({
          snackbar: {
            type: "error", //success || error || warning || info
            title: "Foutcode CSB114",
            text: "De reservering heeft een overlap met een bestaande boeking.",
          },
        }),
      });
    }

    const bookingGroup = uuidv4();

    await prisma.Booking.create({
      data: {
        name: body.details.name,
        description: body.details.description,
        tsFrom: utcFromTS,
        dateFd: body.details.dateFrom.slice(8, 10),
        dateFm: body.details.dateFrom.slice(5, 7),
        dateFy: body.details.dateFrom.slice(0, 4),
        dateFh: body.details.timeFrom.slice(0, 2),
        dateFi: body.details.timeFrom.slice(3, 5),
        tsTo: utcToTS,
        dateTd: body.details.dateTo.slice(8, 10),
        dateTm: body.details.dateTo.slice(5, 7),
        dateTy: body.details.dateTo.slice(0, 4),
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

    await writeActionlog();

    return resolve({
      body: JSON.stringify({
        snackbar: {
          type: "success", //success || error || warning || info
          title: "Succes",
          text: "De reservering is aangemaakt.",
        },
      }),
    });
  });
};

export default createSingleBooking;
