import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "DPE",
    rightName: "calendar_roomSettings_deletePerk",
    actionName: "delete-perk",
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
            title: "Foutcode DPE39",
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
      try {
        // first, update all assembleeSpecs that have this perk selected and disconnect the id from it.
        // const assembleeSpecsToUpdate = await prisma.assembleeSpecs.findMany({
        //   where: {
        //     assembleeId: body.perk,
        //   },
        // });

        // const updatePromises = assembleeSpecsToUpdate.map((assembleeSpec) => {
        //   console.log("query voor:", assembleeSpec.id);
        //   return prisma.assembleeSpecs.update({
        //     where: {
        //       id: assembleeSpec.id,
        //     },
        //     data: {
        //       assemblee: {
        //         disconnect: [{ id: body.perk }],
        //       },
        //     },
        //   });
        // });

        // await Promise.all(updatePromises);

        await prisma.assembleeSpecs
          .updateMany({
            where: {
              assembleeId: body.perk,
            },
            data: {
              assembleeId: null,
            },
          })
          .then((r) => {
            // console.log("r", r);
          });

        await prisma.Assemblee.delete({
          where: {
            id: body.perk,
          },
        }).then(async () => {
          await prisma.$disconnect();
        });

        await writeActionlog();

        return {
          body: JSON.stringify({
            snackbar: {
              type: "success", //success || error || warning || info
              title: "Succes",
              text: `Item verwijderd`,
            },
          }),
        };
      } catch (error) {
        await prisma.$disconnect();
        return {
          body: JSON.stringify({
            snackbar: {
              type: "error", //success || error || warning || info
              title: "Foutcode DPE83",
              text: "De benodigdheid kon niet verwijderd worden.",
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
