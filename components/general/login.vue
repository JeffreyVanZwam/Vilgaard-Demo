<template>
  <div
    class="relative h-screen w-screen bg-gray-100 flex flex-col items-center justify-center"
  >
    <div
      v-if="showPassReset"
      class="fixed top-0 left-0 h-screen w-screen flex items-center justify-center z-9999"
    >
      <generalDarkOverlay class="z-9998" @click="showPassReset = false" />
      <generalLostPass class="z-9999" @closePassReset="showPassReset = false" />
    </div>

    <div class="flex flex-col md:flex-row items-center gap-2">
      <generalLogo class="h-16" />
      <div class="flex flex-col items-center gap-0">
        <span class="font-light text-sm">De Vilgaard</span>
        <span class="font-bold uppercase text-lg">Management dashboard</span>
      </div>
    </div>
    <div class="flex items-center">
      <div
        class="mt-8 bg-white shadow-mainBlack dark:shadow-mainWhite rounded-md overflow-hidden flex items-center"
      >
        <form @submit.prevent="handleSubmit" class="w-full my-8 mx-10">
          <div class="relative flex items-center mb-4">
            <input
              type="email"
              v-model="email"
              placeholder="E-mail"
              id="email"
              class="w-full border rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer"
              :class="
                error.errorType != 'emailError'
                  ? 'border-standards-gray-label text-standards-gray-midnight'
                  : ' border-red-400 text-red-400'
              "
            />
            <label
              for="email"
              class="absolute left-2 transition-all cursor-pointer"
              :class="
                error.errorType != 'emailError'
                  ? ' text-standards-gray-label'
                  : ' text-red-400'
              "
              >E-mail</label
            >
          </div>
          <div class="relative flex items-center mb-4">
            <input
              type="password"
              v-model="password"
              placeholder="Password"
              id="password"
              class="w-full border-opacity-80 opacity-80 border rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer"
              :class="
                error.errorType != 'passError'
                  ? ' border-standards-gray-label text-standards-gray-midnight'
                  : ' border-red-400 text-red-400'
              "
            />
            <label
              for="password"
              class="absolute left-2 transition-all cursor-pointer"
              :class="
                error.errorType != 'passError'
                  ? ' text-gray-light'
                  : ' text-red-400'
              "
              >Wachtwoord</label
            >
          </div>
          <div class="flex items-center mb-2 relative">
            <label class="container"
              >Onthoud mij
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                v-model="rememberMeStatus"
                @click="toggleRememberMe($event)"
              />
              <span class="checkmark"></span>
            </label>
          </div>
          <p v-if="error.errorType != null" class="text-red-400">
            {{ error.errorMessage }}
          </p>
          <button
            class="rounded-md shadow-mainBlack dark:shadow-mainWhite h-8 shrink-0 flex items-center justify-center transition-all cursor-pointer bg-green-400 text-white py-2 px-4 w-max"
          >
            Inloggen
          </button>
        </form>
      </div>
    </div>
    <span class="mt-4 text-xs cursor-pointer" @click="togglePassReset"
      >Wachtwoord vergeten</span
    >
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from "firebase/auth";

export default {
  setup() {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();

    const router = useRouter();
    const email = ref("");
    const password = ref("");
    const rememberMeValue = ref(null);
    const rememberMeStatus = ref(null);
    const showPassReset = ref(false);
    const error = ref({
      errorType: null,
      errorMessage: "",
    });

    const handleSubmit = async () => {
      error.value.errorType = null;
      error.value.errorMessage = "";

      try {
        const userdata = await signInWithEmailAndPassword(
          $authDirect(),
          email.value,
          password.value
        );

        checkRememberMe();

        // update the user' data in Prisma
        // TODO: update user.email in Prisma, because this can be changed by admin or on profile page
        let startpage = "dashboard";
        await $fetch("/api/processLogin", {
          method: "post",
          body: { auth: $authDirect(), user: userdata },
        }).then((res) => {
          const returnBody = JSON.parse(res.body);
          if (returnBody && returnBody.snackbar) {
            snackbar.add(returnBody.snackbar);
          }
          if (returnBody && returnBody.startpage) {
            startpage = returnBody.startpage;
          }
        });

        router.push("/" + startpage);
      } catch (err) {
        if (err.code == "auth/invalid-email") {
          error.value.errorType = "emailError";
          error.value.errorMessage = "Ongeldig emailadres";
        } else if (err.code == "auth/missing-password") {
          error.value.errorType = "passError";
          error.value.errorMessage = "Geen wachtwoord ingevuld";
        } else if (err.code == "auth/network-request-failed") {
          error.value.errorType = "emailError";
          error.value.errorMessage =
            "Kan geen verbinding maken. Controleer uw internet verbinding.";
        } else if (err.code == "auth/user-not-found") {
          error.value.errorType = "emailError";
          error.value.errorMessage = "Deze gebruiker bestaat niet";
        } else if (err.code == "auth/wrong-password") {
          error.value.errorType = "passError";
          error.value.errorMessage = "Onjuist wachtwoord ingevuld";
        } else {
          error.value.errorType = "general error";
          error.value.errorMessage = err.message;
        }
      }
    };

    const togglePassReset = () => {
      showPassReset.value = !showPassReset.value;
    };

    const toggleRememberMe = (e) => {
      rememberMeValue.value = e.target.checked;
      localStorage.setItem("rememberMeStatus", e.target.checked);
    };

    const checkRememberMe = () => {
      if (rememberMeStatus.value == "true") {
        localStorage.setItem("rememberMeValue", email.value);
      } else {
        localStorage.removeItem("rememberMeValue");
      }
    };

    onMounted(async () => {
      if (localStorage.getItem("rememberMeStatus")) {
        rememberMeStatus.value = localStorage.getItem("rememberMeStatus");
        rememberMeValue.value = localStorage.getItem("rememberMeValue");
      }

      if (
        localStorage.getItem("rememberMeValue") &&
        localStorage.getItem("rememberMeStatus") == "true"
      ) {
        email.value = localStorage.getItem("rememberMeValue");
      }
    });

    return {
      email,
      rememberMeValue,
      rememberMeStatus,
      password,
      error,
      handleSubmit,
      toggleRememberMe,
      checkRememberMe,
      togglePassReset,
      showPassReset,
    };
  },
};
</script>

<style scoped>
input:focus + label,
input:not(:placeholder-shown) + label {
  transform: translateY(-22px);
  @apply text-sm;
  background-color: white;
}

input::placeholder {
  color: transparent;
}
.container {
  @apply flex items-center;
  position: relative;
  padding-left: 20px;
  cursor: pointer;
  font-size: 16px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  @apply bg-standards-gray-label;
  position: absolute;
  top: 2px;
  left: 0;
  height: 16px;
  width: 16px;
  border-radius: 5px;
  transition: all 150ms ease-in-out;
}

/* On mouse-over, add a grey background color */
.container:hover input ~ .checkmark {
  @apply bg-standards-gray-dark;
}

/* When the checkbox is checked, add a blue background */
.container input:checked ~ .checkmark {
  @apply bg-palettes-vilgaard-primary;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 6px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>