import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";
import { v4 as uuidv4 } from "uuid";

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
            title: "Foutcode UBO40",
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
              title: "Foutcode UBO68",
              text: "Invoervelden mogen niet leeg zijn.",
            },
          }),
        };
      }

      const checkForOverlappingBookings = async (sd, ed, id) => {
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

        const clashStartDate = new Date(sd);
        const clashEndDate = new Date(ed);

        const clashingBookings = allCurrentBookings.filter((booking) => {
          const bookingStartDate = new Date(
            `${booking.dateFy}-${booking.dateFm}-${booking.dateFd} ${booking.dateFh}:${booking.dateFi}`
          );
          const bookingEndDate = new Date(
            `${booking.dateTy}-${booking.dateTm}-${booking.dateTd} ${booking.dateTh}:${booking.dateTi}`
          );

          if (
            booking.id != id &&
            ((clashStartDate >= bookingStartDate &&
              clashStartDate < bookingEndDate) ||
              (clashEndDate > bookingStartDate &&
                clashEndDate <= bookingEndDate) ||
              (clashStartDate < bookingStartDate &&
                clashEndDate > bookingEndDate))
          ) {
            // Overlap detected
            return true;
          }
        });

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
                type: "warning", //success || error || warning || info
                title: "Foutcode UBO132",
                text: `De reservering heeft een overlap met een bestaande boeking op ${clashDates}.`,
              },
            }),
          };
        }
      };

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

      const fromTS = new Date(thisStartDate).getTime();
      const toTS = new Date(thisEndDate).getTime();
      const newBookingGroup = uuidv4();

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
        const assembleeSpecsToDelete = existingAssembleeSpecsIds.filter(
          (id) => {
            return !body.details.perks.some((assemblee) => {
              return assemblee.id === id.asid;
            });
          }
        );

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

      // Update all data in Prisma
      try {
        if (body.updateList && body.updateList != "") {
          // perform actions for repeat bookings

          //   Edit only the single booking
          if (body.updateList == "editCurrent") {
            const overlap = await checkForOverlappingBookings(
              body.details.dateFrom,
              body.details.dateTo,
              body.id
            );

            if (overlap && overlap.body) {
              const overlapReturn = JSON.parse(overlap.body);

              if (overlapReturn.snackbar) {
                return overlap;
              }
            }

            const data = {
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

            updateAssembleeForBooking(body.id);

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

            for (const ib of involvedBookings) {
              const currentBooking = await prisma.booking.findUnique({
                where: {
                  id: ib.id,
                },
              });

              const currentStartDate = new Date(
                `${currentBooking.dateFy}-${currentBooking.dateFm}-${
                  currentBooking.dateFd
                } ${
                  body.details.fullDay
                    ? "00"
                    : body.details.timeFrom.split(":")[0]
                }:${
                  body.details.fullDay
                    ? "00"
                    : body.details.timeFrom.split(":")[1]
                }`
              );
              const currentEndDate = new Date(
                `${currentBooking.dateTy}-${currentBooking.dateTm}-${
                  currentBooking.dateTd
                } ${
                  body.details.fullDay
                    ? "00"
                    : body.details.timeTo.split(":")[0]
                }:${
                  body.details.fullDay
                    ? "00"
                    : body.details.timeTo.split(":")[1]
                }`
              );

              const overlap = await checkForOverlappingBookings(
                currentStartDate,
                currentEndDate,
                ib.id
              );

              if (overlap && overlap.body) {
                const overlapReturn = JSON.parse(overlap.body);

                if (overlapReturn.snackbar) {
                  return overlap;
                }
              }

              updateAssembleeForBooking(ib.id);

              const newFromTS = new Date(currentStartDate).getTime();
              const newToTS = new Date(currentEndDate).getTime();

              await prisma.booking.update({
                where: {
                  id: ib.id,
                },
                data: {
                  name: body.details.name,
                  description: body.details.description,
                  tsFrom: "" + newFromTS,
                  dateFh: body.details.fullDay
                    ? "00"
                    : body.details.timeFrom.split(":")[0],
                  dateFi: body.details.fullDay
                    ? "00"
                    : body.details.timeFrom.split(":")[1],
                  tsTo: "" + newToTS,
                  dateTh: body.details.fullDay
                    ? "23"
                    : body.details.timeTo.split(":")[0],
                  dateTi: body.details.fullDay
                    ? "59"
                    : body.details.timeTo.split(":")[1],
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
                },
              });
            }
          } else if (body.updateList == "editAll") {
            // first get all bookings that are involved
            const involvedBookings = await prisma.booking.findMany({
              where: {
                bookingGroup: body.bookingGroup,
              },
            });

            for (const ib of involvedBookings) {
              const currentBooking = await prisma.booking.findUnique({
                where: {
                  id: ib.id,
                },
              });

              const currentStartDate = new Date(
                `${currentBooking.dateFy}-${currentBooking.dateFm}-${
                  currentBooking.dateFd
                } ${
                  body.details.fullDay
                    ? "00"
                    : body.details.timeFrom.split(":")[0]
                }:${
                  body.details.fullDay
                    ? "00"
                    : body.details.timeFrom.split(":")[1]
                }`
              );
              const currentEndDate = new Date(
                `${currentBooking.dateTy}-${currentBooking.dateTm}-${
                  currentBooking.dateTd
                } ${
                  body.details.fullDay
                    ? "00"
                    : body.details.timeTo.split(":")[0]
                }:${
                  body.details.fullDay
                    ? "00"
                    : body.details.timeTo.split(":")[1]
                }`
              );

              const overlap = await checkForOverlappingBookings(
                currentStartDate,
                currentEndDate,
                ib.id
              );

              if (overlap && overlap.body) {
                const overlapReturn = JSON.parse(overlap.body);

                if (overlapReturn.snackbar) {
                  return overlap;
                }
              }

              updateAssembleeForBooking(ib.id);

              const newFromTS = new Date(currentStartDate).getTime();
              const newToTS = new Date(currentEndDate).getTime();

              await prisma.booking.update({
                where: {
                  id: ib.id,
                },
                data: {
                  name: body.details.name,
                  description: body.details.description,
                  tsFrom: "" + newFromTS,
                  dateFh: body.details.fullDay
                    ? "00"
                    : body.details.timeFrom.split(":")[0],
                  dateFi: body.details.fullDay
                    ? "00"
                    : body.details.timeFrom.split(":")[1],
                  tsTo: "" + newToTS,
                  dateTh: body.details.fullDay
                    ? "23"
                    : body.details.timeTo.split(":")[0],
                  dateTi: body.details.fullDay
                    ? "59"
                    : body.details.timeTo.split(":")[1],
                  pax: "" + body.details.pax,
                  roomsetup: body.details.roomsetup,
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
                },
              });
            }
          } else {
            await prisma.$disconnect();
            return {
              body: JSON.stringify({
                snackbar: {
                  type: "error", //success || error || warning || info
                  title: "Foutcode UBO512",
                  text: "Het updaten is niet gelukt. Er kon niet bepaald worden welke boekingen uit de reeks gewijzigd moesten worden.",
                },
              }),
            };
          }
        } else {
          // It's a singular booking, so update the details
          const overlap = await checkForOverlappingBookings(
            body.details.dateFrom,
            body.details.dateTo,
            body.id
          );

          if (overlap && overlap.body) {
            const overlapReturn = JSON.parse(overlap.body);

            if (overlapReturn.snackbar) {
              return overlap;
            }
          }

          const data = {
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
            pax: "" + body.details.pax,
            roomsetup: body.details.roomsetup,
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

          updateAssembleeForBooking(body.id);

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
