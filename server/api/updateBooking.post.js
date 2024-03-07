import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import "dayjs/locale/nl";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import weekday from "dayjs/plugin/weekday.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(weekday);
dayjs.extend(customParseFormat);

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "UBO",
    rightName: "calendar_reservationsView_editBooking",
    actionName: "edit-booking",
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
            title: "Foutcode UBO50",
            text: "De gebruiker is niet in de database gevonden.",
          },
        }),
      };
    }
  };

  const newBookingGroup = uuidv4();
  const clashingBookings = [];
  const orConditions = [];

  const checkForOverlappingBookings = async (query) => {
    const roomIds = body.details.rooms.map((room) => room.id);

    await prisma.Booking.findMany({
      where: {
        rooms: {
          some: {
            id: {
              in: roomIds,
            },
          },
        },
        OR: query,
        NOT: {
          bookingGroup: body.bookingGroup,
        },
      },
    })
      .then((booking) => {
        booking.forEach((element) => {
          clashingBookings.push(element);
        });
      })
      .then(async () => {
        await prisma.$disconnect();
      });
  };

  // TODO: this code doesn't check for repeated bookings. It only adjust the selected one.
  const updateAssembleeForBooking = async (bookingID) => {
    // First update, create or delete assembleeSpecs
    body.details.perks.map(async (perk) => {
      const firstAssembleeSpec = await prisma.assembleeSpecs.findFirst({
        where: {
          bookingId: bookingID,
          assembleeId: perk.id,
        },
      });

      // if it exist, update the record
      if (firstAssembleeSpec) {
        await prisma.assembleeSpecs.update({
          where: {
            id: firstAssembleeSpec.id,
          },
          data: {
            count: perk.count,
          },
        });
      } else {
        // else, create the record
        await prisma.assembleeSpecs.create({
          data: {
            bookingId: bookingID,
            assembleeId: perk.id,
            count: perk.count,
          },
        });
      }
    });

    //   check for existing rows for this booking
    const existingAssembleeSpecs = await prisma.assembleeSpecs.findMany({
      where: {
        bookingId: bookingID,
      },
    });

    // Collect all existing AssembleeSpecs IDs to check against for updates
    const existingAssembleeSpecsIds = existingAssembleeSpecs.map((as) => {
      return { id: as.id, asid: as.assembleeId };
    });

    // Gather the IDs of the AssembleeSpecs that should be deleted
    const assembleeSpecsToDelete = existingAssembleeSpecsIds.filter((id) => {
      return !body.details.perks.some((assemblee) => {
        return assemblee.id === id.asid;
      });
    });

    const deleteIds = assembleeSpecsToDelete.map((as) => as.id);

    // Delete the AssembleeSpecs rows that should be deleted
    await Promise.all([
      prisma.assembleeSpecs.deleteMany({
        where: {
          id: { in: deleteIds },
        },
      }),
    ]);
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
              title: "Foutcode UBO176",
              text: "Invoervelden mogen niet leeg zijn.",
            },
          }),
        };
      }

      const thisStartDate = dayjs(
        `${body.details.dateFrom} ${body.details.timeFrom}`,
        "YYYY-MM-DD HH:mm",
        "nl"
      )
        .set("second", 0)
        .set("millisecond", 0)
        .locale("nl");

      const fromTS = "" + thisStartDate.valueOf();

      const thisEndDate = dayjs(
        `${body.details.dateTo} ${body.details.timeTo}`,
        "YYYY-MM-DD HH:mm",
        "nl"
      )
        .set("second", 0)
        .set("millisecond", 0)
        .locale("nl");

      const toTS = "" + thisEndDate.valueOf();

      // Update all data in Prisma
      try {
        if (body.updateList && body.updateList != "") {
          // perform actions for repeat bookings

          //   Edit only the single booking
          if (body.updateList == "editCurrent") {
            // Push into the OR conditions array
            orConditions.push({
              AND: [
                { tsFrom: { lte: "" + fromTS } },
                { tsTo: { gt: "" + fromTS } },
              ],
            });
            orConditions.push({
              AND: [
                { tsFrom: { lt: "" + toTS } },
                { tsTo: { gte: "" + toTS } },
              ],
            });
            orConditions.push({
              AND: [
                { tsFrom: { gt: "" + fromTS } },
                { tsTo: { lt: "" + toTS } },
              ],
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

              return {
                body: JSON.stringify({
                  snackbar: {
                    type: "error", //success || error || warning || info
                    title: "Foutcode UBO249",
                    text: `De reservering heeft een overlap met ${
                      clashingBookings.length == 1
                        ? "een bestaande boeking"
                        : "bestaande boekingen"
                    } op ${clashDates}.`,
                  },
                }),
              };
            } else {
              const data = {
                name: body.details.name,
                description: body.details.description,
                tsFrom: "" + fromTS,
                dateFd: body.details.dateFrom.slice(8, 10),
                dateFm: body.details.dateFrom.slice(5, 7),
                dateFy: body.details.dateFrom.slice(0, 4),
                dateFh: body.details.timeFrom.slice(0, 2),
                dateFi: body.details.timeFrom.slice(3, 5),
                tsTo: "" + toTS,
                dateTd: body.details.dateTo.slice(8, 10),
                dateTm: body.details.dateTo.slice(5, 7),
                dateTy: body.details.dateTo.slice(0, 4),
                dateTh: body.details.timeTo.slice(0, 2),
                dateTi: body.details.timeTo.slice(3, 5),
                pax: "" + body.details.pax,
                roomsetup: body.details.roomsetup,
                bookingGroup: newBookingGroup,
                fullDay: body.details.fullDay,
                rooms: {
                  set: body.details.rooms.map((room) => ({
                    id: room.id,
                  })),
                },
                persons: {
                  set: body.details.persons.map((person) => ({
                    id: person.id,
                  })),
                },
                isExportable: body.details.isExportable,
                rssLocation: body.details.rssLocation,
              };

              await updateAssembleeForBooking(body.id);

              // update the actual booking
              await prisma.booking
                .update({
                  where: {
                    id: body.id,
                  },
                  data: data,
                })
                .then(async () => {
                  await prisma.$disconnect();
                });
            }
          } else if (body.updateList == "editCurrentAndNext") {
            // first get all bookings that are involved
            const involvedBookings = await prisma.booking.findMany({
              where: {
                bookingGroup: body.bookingGroup,
                tsFrom: {
                  gte: "" + fromTS,
                },
              },
            });

            involvedBookings.map((ib) => {
              const fH = body.details.timeFrom.slice(0, 2);
              const fI = body.details.timeFrom.slice(3, 5);
              const tH = body.details.timeTo.slice(0, 2);
              const tI = body.details.timeTo.slice(3, 5);

              const newFromTS = dayjs(+ib.tsFrom)
                .locale("nl")
                .set("hour", +fH)
                .set("minute", +fI)
                .valueOf();
              const newToTS = dayjs(+ib.tsTo)
                .locale("nl")
                .set("hour", +tH)
                .set("minute", +tI)
                .valueOf();

              orConditions.push({
                AND: [
                  { tsFrom: { lte: "" + newFromTS } },
                  { tsTo: { gt: "" + newFromTS } },
                ],
              });
              orConditions.push({
                AND: [
                  { tsFrom: { lt: "" + newToTS } },
                  { tsTo: { gte: "" + newToTS } },
                ],
              });
              orConditions.push({
                AND: [
                  { tsFrom: { gt: "" + newFromTS } },
                  { tsTo: { lt: "" + newToTS } },
                ],
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

              return {
                body: JSON.stringify({
                  snackbar: {
                    type: "error", //success || error || warning || info
                    title: "Foutcode UBO369",
                    text: `De reservering heeft een overlap met ${
                      clashingBookings.length == 1
                        ? "een bestaande boeking"
                        : "bestaande boekingen"
                    } op ${clashDates}.`,
                  },
                }),
              };
            }

            await (async () => {
              for (const booking of involvedBookings) {
                const fH = body.details.timeFrom.slice(0, 2);
                const fI = body.details.timeFrom.slice(3, 5);
                const tH = body.details.timeTo.slice(0, 2);
                const tI = body.details.timeTo.slice(3, 5);

                const newFromTS = dayjs(
                  `${booking.dateFd}-${booking.dateFm}-${booking.dateFy}`,
                  "DD-MM-YYYY",
                  "nl"
                )
                  .locale("nl")
                  .set("hour", +fH)
                  .set("minute", +fI)
                  .valueOf();
                const newToTS = dayjs(
                  `${booking.dateTd}-${booking.dateTm}-${booking.dateTy}`,
                  "DD-MM-YYYY",
                  "nl"
                )
                  .locale("nl")
                  .set("hour", +tH)
                  .set("minute", +tI)
                  .valueOf();

                const data = {
                  name: body.details.name,
                  description: body.details.description,
                  tsFrom: "" + newFromTS,
                  dateFh: fH,
                  dateFi: fI,
                  tsTo: "" + newToTS,
                  dateTh: tH,
                  dateTi: tI,
                  pax: "" + body.details.pax,
                  roomsetup: body.details.roomsetup,
                  bookingGroup: newBookingGroup,
                  fullDay: body.details.fullDay,
                  rooms: {
                    set: body.details.rooms.map((room) => ({
                      id: room.id,
                    })),
                  },
                  persons: {
                    set: body.details.persons.map((person) => ({
                      id: person.id,
                    })),
                  },
                  isExportable: body.details.isExportable,
                  rssLocation: body.details.rssLocation,
                };

                await updateAssembleeForBooking(booking.id);

                await prisma.booking
                  .update({
                    where: {
                      id: booking.id,
                    },
                    data: data,
                  })
                  .then(async () => {
                    await prisma.$disconnect();
                  });
              }
            })();
          } else if (body.updateList == "editAll") {
            // first get all bookings that are involved
            const involvedBookings = await prisma.booking.findMany({
              where: {
                bookingGroup: body.bookingGroup,
              },
            });

            involvedBookings.map((ib) => {
              const fH = body.details.timeFrom.slice(0, 2);
              const fI = body.details.timeFrom.slice(3, 5);
              const tH = body.details.timeTo.slice(0, 2);
              const tI = body.details.timeTo.slice(3, 5);

              const newFromTS = dayjs(+ib.tsFrom)
                .locale("nl")
                .set("hour", +fH)
                .set("minute", +fI)
                .valueOf();
              const newToTS = dayjs(+ib.tsTo)
                .locale("nl")
                .set("hour", +tH)
                .set("minute", +tI)
                .valueOf();

              orConditions.push({
                AND: [
                  { tsFrom: { lte: "" + newFromTS } },
                  { tsTo: { gt: "" + newFromTS } },
                ],
              });
              orConditions.push({
                AND: [
                  { tsFrom: { lt: "" + newToTS } },
                  { tsTo: { gte: "" + newToTS } },
                ],
              });
              orConditions.push({
                AND: [
                  { tsFrom: { gt: "" + newFromTS } },
                  { tsTo: { lt: "" + newToTS } },
                ],
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

              return {
                body: JSON.stringify({
                  snackbar: {
                    type: "error", //success || error || warning || info
                    title: "Foutcode UBO503",
                    text: `De reservering heeft een overlap met ${
                      clashingBookings.length == 1
                        ? "een bestaande boeking"
                        : "bestaande boekingen"
                    } op ${clashDates}.`,
                  },
                }),
              };
            }

            await (async () => {
              for (const booking of involvedBookings) {
                const fH = body.details.timeFrom.slice(0, 2);
                const fI = body.details.timeFrom.slice(3, 5);
                const tH = body.details.timeTo.slice(0, 2);
                const tI = body.details.timeTo.slice(3, 5);

                const newFromTS = dayjs(
                  `${booking.dateFd}-${booking.dateFm}-${booking.dateFy}`,
                  "DD-MM-YYYY",
                  "nl"
                )
                  .locale("nl")
                  .set("hour", +fH)
                  .set("minute", +fI)
                  .valueOf();
                const newToTS = dayjs(
                  `${booking.dateTd}-${booking.dateTm}-${booking.dateTy}`,
                  "DD-MM-YYYY",
                  "nl"
                )
                  .locale("nl")
                  .set("hour", +tH)
                  .set("minute", +tI)
                  .valueOf();

                const data = {
                  name: body.details.name,
                  description: body.details.description,
                  tsFrom: "" + newFromTS,
                  dateFh: fH,
                  dateFi: fI,
                  tsTo: "" + newToTS,
                  dateTh: tH,
                  dateTi: tI,
                  pax: "" + body.details.pax,
                  roomsetup: body.details.roomsetup,
                  bookingGroup: newBookingGroup,
                  fullDay: body.details.fullDay,
                  rooms: {
                    set: body.details.rooms.map((room) => ({
                      id: room.id,
                    })),
                  },
                  persons: {
                    set: body.details.persons.map((person) => ({
                      id: person.id,
                    })),
                  },
                  isExportable: body.details.isExportable,
                  rssLocation: body.details.rssLocation,
                };

                await updateAssembleeForBooking(booking.id);

                await prisma.booking
                  .update({
                    where: {
                      id: booking.id,
                    },
                    data: data,
                  })
                  .then(async () => {
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
                  title: "Foutcode UBO583",
                  text: "Het updaten is niet gelukt. Er kon niet bepaald worden welke boekingen uit de reeks gewijzigd moesten worden.",
                },
              }),
            };
          }
        } else {
          // It's a singular booking, so update the details
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
            AND: [{ tsFrom: { gt: "" + fromTS } }, { tsTo: { lt: "" + toTS } }],
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

            return {
              body: JSON.stringify({
                snackbar: {
                  type: "error", //success || error || warning || info
                  title: "Foutcode UBO622",
                  text: `De reservering heeft een overlap met ${
                    clashingBookings.length == 1
                      ? "een bestaande boeking"
                      : "bestaande boekingen"
                  } op ${clashDates}.`,
                },
              }),
            };
          } else {
            const data = {
              name: body.details.name,
              description: body.details.description,
              tsFrom: "" + fromTS,
              dateFd: body.details.dateFrom.slice(8, 10),
              dateFm: body.details.dateFrom.slice(5, 7),
              dateFy: body.details.dateFrom.slice(0, 4),
              dateFh: body.details.timeFrom.slice(0, 2),
              dateFi: body.details.timeFrom.slice(3, 5),
              tsTo: "" + toTS,
              dateTd: body.details.dateTo.slice(8, 10),
              dateTm: body.details.dateTo.slice(5, 7),
              dateTy: body.details.dateTo.slice(0, 4),
              dateTh: body.details.timeTo.slice(0, 2),
              dateTi: body.details.timeTo.slice(3, 5),
              pax: "" + body.details.pax,
              roomsetup: body.details.roomsetup,
              bookingGroup: newBookingGroup,
              fullDay: body.details.fullDay,
              rooms: {
                set: body.details.rooms.map((room) => ({
                  id: room.id,
                })),
              },
              persons: {
                set: body.details.persons.map((person) => ({
                  id: person.id,
                })),
              },
              isExportable: body.details.isExportable,
              rssLocation: body.details.rssLocation,
            };

            await updateAssembleeForBooking(body.id);

            // update the actual booking
            await prisma.booking
              .update({
                where: {
                  id: body.id,
                },
                data: data,
              })
              .then(async () => {
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
              title: "Foutcode UBO699",
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
