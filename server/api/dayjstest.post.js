import dayjs from "dayjs";
import "dayjs/locale/nl";
// dayjs.locale("nl", {}, true);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  let response = (async (result) => {
    // Else perform main logic here

    try {
      const datum = "2023-09-10";
      const tijd = "15:00";

      //   dayjs().locale("ru");
      const el = dayjs().locale("nl", {}, true);

      //   const el = dayjs(`${datum} ${tijd}`);
      console.log("el: ", el);

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

      return {
        body: JSON.stringify({
          snackbar: {
            type: "error", //success || error || warning || info
            title: "---",
            text: "De wijzigingen konden niet worden opgeslagen.",
          },
        }),
      };
    }
  })();

  return response;
});
