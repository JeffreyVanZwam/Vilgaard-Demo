import { PrismaClient } from "@prisma/client";
import checkAuth from "./utils/auth";

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient();
  const body = await readBody(event);

  const data = {
    auth: body.auth,
    errorCode: "UPEO",
    rightName: "calendar_roomSettings_editPerk",
    actionName: null,
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
        for (const perk of body.perks) {
          await prisma.Assemblee.update({
            where: { id: perk.id },
            data: { position: perk.position },
          });
        }

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
              title: "Foutcode UPEO51",
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
