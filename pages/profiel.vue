<template>
  <div class="">
    <section v-if="user">
      <generalDarkOverlay @click="cancelUpdate" v-if="showEditBox" />

      <!-- EDIT MODAL -->
      <div
        class="transform transition-all fixed z-9882 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center justify-center px-8 py-12 bg-white dark:bg-black rounded-lg max-w-2xl"
        :class="showEditBox ? 'flex flex-col' : 'hidden'"
        style="width: calc(100% - 48px)"
      >
        <h3
          class="text-standards-gray-midnight dark:text-standards-gray-mid font-medium text-lg sm:text-2xl mb-8 text-center md:text-left"
        >
          Bewerk gebruikersinformatie
        </h3>
        <div class="grid grid-cols-1 xs:grid-cols-2 w-full gap-4">
          <div class="relative flex items-center col-span-1 xs:col-span-2">
            <input
              type="email"
              v-model="editUser.email"
              placeholder="E-mail"
              id="email"
              class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
              :class="
                error.errorName != 'emailError'
                  ? 'border-standards-gray-label text-standards-gray-midnight dark:text-standards-gray-mid'
                  : 'border border-red-400 text-red-400'
              "
            />
            <label
              for="email"
              class="absolute left-2 transition-all cursor-pointer"
              :class="
                error.errorName != 'emailError'
                  ? ' text-standards-gray-midnight dark:text-standards-gray-mid'
                  : ' text-red-400'
              "
              >E-mail*</label
            >
          </div>

          <div class="relative flex items-center">
            <input
              type="firstname"
              v-model="editUser.firstname"
              placeholder="Voornaam"
              id="firstname"
              class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer text-standards-gray-midnight dark:text-standards-gray-mid inputfield"
            />
            <label
              for="firstname"
              class="absolute left-2 transition-all cursor-pointer text-standards-gray-midnight dark:text-standards-gray-mid"
              >Voornaam</label
            >
          </div>
          <div class="relative flex items-center">
            <input
              type="lastname"
              v-model="editUser.lastname"
              placeholder="Achternaam"
              id="lastname"
              class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer text-standards-gray-midnight dark:text-standards-gray-mid inputfield"
            />
            <label
              for="lastname"
              class="absolute left-2 transition-all cursor-pointer text-standards-gray-midnight dark:text-standards-gray-mid"
              >Achternaam</label
            >
          </div>
        </div>
        <p
          v-if="error.errorName != null"
          class="mt-4"
          :class="
            error.errorType == 'error' ? 'text-red-400' : 'text-green-400'
          "
        >
          {{ error.errorMessage }}
        </p>
        <div
          class="relative flex flex-col xs:flex-row items-center gap-4 mt-12 select-none"
        >
          <button
            @click="updateUser()"
            class="bg-palettes-theme-primary rounded-lg text-white uppercase transform transition-all font-medium text-sm px-5 h-9.5"
            :class="
              isLoading
                ? ' bg-opacity-60 cursor-not-allowed'
                : ' bg-opacity-100 cursor-pointer'
            "
          >
            <Icon
              name="solar:hourglass-broken"
              class="h-6 w-6 text-palettes-theme-gray hourglass"
              v-if="isLoading"
            />

            <span v-else> Opslaan </span>
          </button>
          <button
            @click="cancelUpdate()"
            class="bg-standards-gray-label rounded-lg text-standards-gray-midnight uppercase font-medium text-sm px-5 h-9.5"
          >
            Annuleren
          </button>
        </div>
      </div>
      <!-- MAIN CONTENT -->
      <div
        class="flex flex-col sm:flex-row mt-4 justify-between items-start gap-4"
      >
        <div
          class="w-full sm:w-1/3 bg-white dark:bg-black rounded-xl text-standards-gray-midnight dark:text-standards-gray-mid shadow-mainBlack dark:shadow-mainWhite flex flex-col justify-start items-center"
          v-if="user"
        >
          <div class="p-4 flex flex-col justify-start items-center">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              class="w-20 h-20 lg:w-30 lg:h-30 rounded-md object-cover mt-6 lg:mt-14"
            />

            <div
              v-else
              class="w-20 h-20 lg:w-30 lg:h-30 rounded-md object-cover mt-6 lg:mt-14 bg-palettes-theme-secondary border-4 border-palettes-theme-primary flex items-center justify-center uppercase text-xl md:text-3xl font-semibold"
            >
              <div v-if="user.firstname && user.lastname">
                <span v-if="user.firstname">{{
                  user.firstname.slice(0, 1) + user.lastname.slice(0, 1)
                }}</span>
              </div>
              <div v-else>
                {{ user.email.slice(0, 2) }}
              </div>
            </div>

            <h6
              class="mt-4 font-medium text-base lg:text-xl text-palettes-theme-gray dark:text-standards-gray-mid"
            >
              {{ user.firstname + " " + user.lastname }}
            </h6>
            <div
              class="w-min text-[10px] lg:text-xs font-medium md:font-semibold uppercase py-1 px-2 rounded-lg mt-4"
              :style="`background-color:${user.accountType.backgroundColor};color:${user.accountType.textColor}`"
            >
              {{ user.accountType.display }}
            </div>
          </div>

          <hr
            class="bg-standards-gray-light dark:bg-standards-gray-midnight h-1 w-full mt-6 mb-4"
          />

          <div class="p-6 w-full flex flex-col items-start overflow-hidden">
            <h2 class="uppercase text-gray-h6 mb-4">Details</h2>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span
                class="text-standards-gray-midnight dark:text-standards-gray-mid text-base font-semibold"
                >Naam:</span
              >
              <span
                class="text-standards-gray-dark dark:text-standards-gray-mid text-sm"
                >{{ user.firstname + " " + user.lastname }}</span
              >
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span
                class="text-standards-gray-midnight dark:text-standards-gray-mid text-base font-semibold"
                >Email:</span
              >
              <span
                class="text-standards-gray-dark dark:text-standards-gray-mid text-sm"
                >{{ user.email }}</span
              >
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span
                class="text-standards-gray-midnight dark:text-standards-gray-mid text-base font-semibold"
                >Rol:</span
              >
              <span
                class="text-standards-gray-dark dark:text-standards-gray-mid text-sm"
                >{{ user.accountType.display }}</span
              >
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span
                class="text-standards-gray-midnight dark:text-standards-gray-mid text-base font-semibold"
                >ID:</span
              >
              <span
                class="text-standards-gray-dark dark:text-standards-gray-mid text-sm"
                style="overflow-wrap: anywhere"
                >{{ user.id }}</span
              >
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span
                class="text-standards-gray-midnight dark:text-standards-gray-mid text-base font-semibold"
                >Status:</span
              >
              <span
                class="text-standards-gray-dark dark:text-standards-gray-mid text-sm"
                >{{ user.blocked ? "Geblokkeerd" : "Actief" }}</span
              >
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span
                class="text-standards-gray-midnight dark:text-standards-gray-mid text-base font-semibold"
                >Lid sinds:</span
              >
              <span
                class="text-standards-gray-dark dark:text-standards-gray-mid text-sm"
                >{{ memberSince }}</span
              >
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span
                class="text-standards-gray-midnight dark:text-standards-gray-mid text-base font-semibold"
                >Laatst ingelogd:</span
              >
              <span
                class="text-standards-gray-dark dark:text-standards-gray-mid text-sm"
                >{{ lastLogin }}</span
              >
            </div>
          </div>
          <button
            class="bg-palettes-theme-secondary text-palettes-theme-gray rounded-xl py-2 px-4 uppercase my-4 text-sm font-medium"
            @click="showEditBox = true"
          >
            bewerken
          </button>
        </div>

        <!-- Right side -->
        <div class="w-full sm:w-2/3 flex flex-col gap-4">
          <div class="w-full flex flex-col xs:flex-row gap-4 justify-start">
            <generalTabsSecurity
              :selectedTab="selectedTab"
              @changeTab="toggleTab($event)"
              tabName="security"
              tabDisplay="Beveiliging"
              class="w-full xs:w-1/2 sm:w-1/3 xl:w-1/4 2xl:w-1/5"
            />
            <generalTabsLogs
              :selectedTab="selectedTab"
              @changeTab="toggleTab($event)"
              tabName="logs"
              tabDisplay="Logs"
              class="w-full xs:w-1/2 sm:w-1/3 xl:w-1/4 2xl:w-1/5"
            />
          </div>
          <profileSecurity
            v-if="selectedTab == 'security'"
            :user="user"
            id="security"
          />
          <usersLogs v-if="selectedTab == 'logs'" :user="user" id="logs" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { useGeneralStore } from "@/store/general";
import { getAuth, updateEmail, signOut } from "firebase/auth";

export default {
  setup() {
    // const { $auth } = useNuxtApp();
    const { $authDirect } = useNuxtApp();
    const router = useRouter();
    const auth = getAuth();
    const snackbar = useSnackbar();
    const generalStore = useGeneralStore();

    const showEditBox = ref(false);
    const error = ref({
      errorName: null,
      errorMessage: "",
      errorType: null,
    });
    const editUser = ref({
      firstname: "",
      lastname: "",
      accountType: {},
      accountTypeId: {},
      email: "",
    });
    const isLoading = ref(false);
    const selectedTab = ref("security");
    const user = ref(null);

    const memberSince = computed(() => {
      let date = new Date(user.value.memberSince);
      let day = date.getDate();
      if (day < 10) day = "0" + day;
      let month = date.getMonth() + 1;
      if (month < 10) month = "0" + month;
      let hour = date.getHours();
      if (hour < 10) hour = "0" + hour;
      let minutes = date.getMinutes();
      if (minutes < 10) minutes = "0" + minutes;
      return `${day}-${month}-${date.getFullYear()} ${hour}:${minutes}`;
    });

    const lastLogin = computed(() => {
      let date = new Date(user.value.lastLogin);
      let day = date.getDate();
      if (day < 10) day = "0" + day;
      let month = date.getMonth() + 1;
      if (month < 10) month = "0" + month;
      let hour = date.getHours();
      if (hour < 10) hour = "0" + hour;
      let minutes = date.getMinutes();
      if (minutes < 10) minutes = "0" + minutes;
      return `${day}-${month}-${date.getFullYear()} ${hour}:${minutes}`;
    });

    watch(showEditBox, (n) => {
      if (n) {
        generalStore.HIDE_MENU_BTN();
      } else {
        generalStore.SHOW_MENU_BTN();
      }
    });

    watch(user, (n) => {
      if (n) {
        editUser.value.firstname = n.firstname;
        editUser.value.lastname = n.lastname;
        editUser.value.email = n.email;
      }
    });

    const toggleTab = (e) => {
      selectedTab.value = e;
      const el = document.getElementById(selectedTab.value);
      // TODO: not working somehow
      if (el) {
        el.scrollIntoView();
      }
    };

    const cancelUpdate = () => {
      showEditBox.value = false;
      editUser.value.firstname = user.value.firstname;
      editUser.value.lastname = user.value.lastname;
      editUser.value.email = user.value.email;
    };

    const updateUser = async () => {
      error.value.errorName = null;
      error.value.errorMessage = "";
      error.value.errorType = null;

      if (editUser.value.email == "") {
        error.value.errorName = "emailError";
        error.value.errorMessage = "Vul aub een email in";
        error.value.errorType = "error";
        return;
      }

      try {
        await updateEmail(auth.currentUser, editUser.value.email);
      } catch (err) {
        if (err.code == "auth/missing-email") {
          error.value.errorName = "emailError";
          error.value.errorType = "error";
          error.value.errorMessage = "Vul aub een emailadres in.";
        } else if (err.code == "auth/invalid-email") {
          error.value.errorName = "emailError";
          error.value.errorType = "error";
          error.value.errorMessage = "Ongeldig emailadres.";
        } else if (err.code == "auth/network-request-failed") {
          error.value.errorName = "general error";
          error.value.errorType = "error";
          error.value.errorMessage =
            "Kan geen verbinding maken. Controleer uw internet verbinding.";
        } else if (err.code == "auth/user-not-found") {
          error.value.errorName = "emailError";
          error.value.errorType = "error";
          error.value.errorMessage = "Deze gebruiker bestaat niet";
        } else if (err.code == "auth/requires-recent-login") {
          error.value.errorName = "general error";
          error.value.errorType = "error";
          error.value.errorMessage =
            "Om deze actie uit te voeren moet je recentelijk ingelogd zijn. Log opnieuw in om je sessie te vernieuwen en probeer opnieuw.";
        } else {
          error.value.errorName = "general error";
          error.value.errorType = "error";
          error.value.errorMessage = err.message;
        }

        return;
      }

      await $fetch("/api/updateProfile", {
        method: "post",
        body: {
          auth: $authDirect(),
          currentUser: user.value,
          submission: {
            id: user.value.id,
            email: editUser.value.email,
            firstname: editUser.value.firstname,
            lastname: editUser.value.lastname,
          },
        },
      }).then(async (res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
        showEditBox.value = false;

        user.value.firstname = editUser.value.firstname;
        user.value.lastname = editUser.value.lastname;

        // If the emailaddress' changed, the user needs to login again, otherwise all server side actions will fail.
        if (user.value.email != editUser.value.email) {
          await signOut($authDirect());
          snackbar.add({
            type: "warning",
            text: "Omdat het emailadres is gewijzigd ben je uitgelogd. ",
          });
          router.push("/");
        }
      });
    };

    onMounted(async () => {
      await $fetch("/api/getUser", {
        method: "post",
        body: $authDirect(),
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          user.value = returnBody;
        }
      });
    });

    return {
      user,
      selectedTab,
      memberSince,
      lastLogin,
      toggleTab,
      isLoading,
      showEditBox,
      error,
      editUser,
      cancelUpdate,
      updateUser,
    };
  },
};
</script>

<style scoped>
</style>