<template>
  <div
    class="mt-8 bg-white shadow-mainBlack dark:shadow-mainWhite rounded-md overflow-hidden flex items-center"
  >
    <form
      @submit.prevent="requestLostPass"
      class="w-full my-8 mx-10 flex flex-col items-center"
    >
      <h2 class="mb-4 font-medium text-base self-start">Wachtwoord vergeten</h2>
      <div class="relative flex items-center mb-4">
        <input
          type="email"
          v-model="requestEmail"
          placeholder="E-mail"
          id="requestEmail"
          class="w-full border-opacity-80 opacity-80 border rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
          :class="
            error.errorType != 'emailError'
              ? 'border-gray-light text-gray-light'
              : ' border-red-400 text-red-400'
          "
        />
        <label
          for="requestEmail"
          class="absolute left-2 transition-all cursor-pointer"
          :class="
            error.errorType != 'emailError'
              ? ' text-gray-light'
              : ' text-red-400'
          "
          >E-mail</label
        >
      </div>
      <p v-if="error.errorType != null" class="text-red-400">
        {{ error.errorMessage }}
      </p>
      <button
        class="rounded-md shadow-mainBlack dark:shadow-mainWhite h-8 shrink-0 flex items-center justify-center transition-all cursor-pointer bg-green-400 text-white py-2 px-4 w-max"
      >
        Herstellink aanvragen
      </button>
      <span class="mt-4 text-xs cursor-pointer" @click="$emit('closePassReset')"
        >Terug naar inloggen</span
      >
    </form>
  </div>
</template>

<script>
import { sendPasswordResetEmail } from "firebase/auth";

export default {
  setup() {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();

    const requestEmail = ref("");
    const error = ref({
      errorType: null,
      errorMessage: "",
    });

    const requestLostPass = async () => {
      error.value.errorType = null;
      error.value.errorMessage = "";

      try {
        await sendPasswordResetEmail($authDirect(), requestEmail.value);
        // TODO: convert this to server side code and add actionLog
        snackbar.add({
          type: "info",
          title: "Controleer uw email",
          text: "Als het opgegeven emailadres bekend is ontvangt u een herstellink.",
        });
      } catch (err) {
        if (err.code == "auth/missing-email") {
          error.value.errorType = "emailError";
          error.value.errorMessage = "Vul aub een emailadres in.";
        } else if (err.code == "auth/invalid-email") {
          error.value.errorType = "passError";
          error.value.errorMessage = "Ongeldig emailadres.";
        } else if (err.code == "auth/network-request-failed") {
          error.value.errorType = "emailError";
          error.value.errorMessage =
            "Kan geen verbinding maken. Controleer uw internet verbinding.";
        } else if (err.code == "auth/user-not-found") {
          error.value.errorType = "emailError";
          error.value.errorMessage = "Deze gebruiker bestaat niet";
        } else {
          error.value.errorType = "general error";
          error.value.errorMessage = err.message;
        }
      }
    };

    return { requestEmail, error, requestLostPass };
  },
};
</script>

<style scoped>
</style>