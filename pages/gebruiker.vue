<template>
  <div class="">
    <section v-if="user">
      <generalDarkOverlay @click="showEditBox = false" v-if="showEditBox" />

      <!-- EDIT MODAL -->
      <div
        class="transform transition-all fixed z-9882 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center justify-center px-8 py-12 bg-white rounded-lg max-w-2xl"
        :class="showEditBox ? 'flex flex-col' : 'hidden'"
        style="width: calc(100% - 48px)"
      >
        <h3
          class="text-standards-gray-midnight font-medium text-lg sm:text-2xl mb-8 text-center md:text-left"
        >
          Bewerk gebruikersinformatie
        </h3>
        <div class="grid grid-cols-1 xs:grid-cols-2 w-full gap-4">
          <div class="relative flex items-center">
            <input
              type="email"
              v-model="editUser.email"
              placeholder="E-mail"
              id="email"
              class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
              :class="
                error.errorName != 'emailError'
                  ? 'border-standards-gray-label text-standards-gray-midnight'
                  : 'border border-red-400 text-red-400'
              "
            />
            <label
              for="email"
              class="absolute left-2 transition-all cursor-pointer"
              :class="
                error.errorName != 'emailError'
                  ? ' text-standards-gray-midnight'
                  : ' text-red-400'
              "
              >E-mail*</label
            >
          </div>

          <div class="relative flex items-center">
            <input
              type="text"
              name="accounttype"
              id="accounttype"
              class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer text-standards-gray-midnight inputfield"
              :class="
                error.errorName != 'accounttypeError'
                  ? ' text-gray-light'
                  : 'border border-red-400 text-red-400'
              "
              v-model="selectedAccountTypeDisplay"
              placeholder="accounttype"
              @click="showAccountTypeDropdown = true"
            />
            <label
              for="accounttype"
              class="absolute left-2 transition-all cursor-pointer"
              :class="
                error.errorName != 'accounttypeError'
                  ? ' text-gray-light'
                  : ' text-red-400'
              "
              >Accounttype</label
            >
            <div
              class="w-full absolute left-0 top-12 bg-white rounded-md border-opacity-80 border border-standards-gray-label text-standards-gray-midnight py-2 z-30"
              v-if="showAccountTypeDropdown"
            >
              <div
                class="cursor-pointer px-4 py-2 hover:bg-palettes-theme-accent-hover hover:bg-opacity-10 transition-all flex items-center justify-start"
                v-for="(type, i) in accountTypes"
                :key="type.type"
                @click="setAccountType(type)"
              >
                <span>
                  {{ type.display }}
                </span>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="right-4 absolute h-6 fill-gray-light cursor-pointer"
              @click="
                (selectedAccountType = null),
                  (selectedAccountTypeDisplay = null)
              "
              v-if="
                selectedAccountType != '' && selectedAccountTypeDisplay != null
              "
              viewBox="0 0 24 24"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
              />
            </svg>
          </div>
          <div class="relative flex items-center">
            <input
              type="firstname"
              v-model="editUser.firstname"
              placeholder="Voornaam"
              id="firstname"
              class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer text-standards-gray-midnight inputfield"
            />
            <label
              for="firstname"
              class="absolute left-2 transition-all cursor-pointer text-standards-gray-midnight"
              >Voornaam</label
            >
          </div>
          <div class="relative flex items-center">
            <input
              type="lastname"
              v-model="editUser.lastname"
              placeholder="Achternaam"
              id="lastname"
              class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer text-standards-gray-midnight inputfield"
            />
            <label
              for="lastname"
              class="absolute left-2 transition-all cursor-pointer text-standards-gray-midnight"
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
          class="w-full sm:w-1/3 bg-white rounded-xl shadow-mainBlack dark:shadow-mainWhite flex flex-col justify-start items-center"
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
              <span>{{ getInitials(user) }}</span>
            </div>

            <h6
              class="mt-4 font-medium text-base lg:text-xl text-palettes-theme-gray"
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

          <hr class="background-gray-light h-1 w-full mt-6 mb-4" />

          <div class="p-6 w-full flex flex-col items-start overflow-hidden">
            <h2 class="uppercase text-gray-h6 mb-4">Details</h2>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span class="text-standards-gray-midnight text-base font-semibold"
                >Naam:</span
              >
              <span class="text-standards-gray-dark text-sm">{{
                user.firstname + " " + user.lastname
              }}</span>
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span class="text-standards-gray-midnight text-base font-semibold"
                >Email:</span
              >
              <span class="text-standards-gray-dark text-sm">{{
                user.email
              }}</span>
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span class="text-standards-gray-midnight text-base font-semibold"
                >Rol:</span
              >
              <span class="text-standards-gray-dark text-sm">{{
                user.accountType.display
              }}</span>
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span class="text-standards-gray-midnight text-base font-semibold"
                >ID:</span
              >
              <span
                class="text-standards-gray-dark text-sm"
                style="overflow-wrap: anywhere"
                >{{ user.id }}</span
              >
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span class="text-standards-gray-midnight text-base font-semibold"
                >Status:</span
              >
              <span class="text-standards-gray-dark text-sm">{{
                user.blocked ? "Geblokkeerd" : "Actief"
              }}</span>
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span class="text-standards-gray-midnight text-base font-semibold"
                >Lid sinds:</span
              >
              <span class="text-standards-gray-dark text-sm">{{
                memberSince
              }}</span>
            </div>
            <div
              class="my-1 flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-0 xs:gap-2 sm:gap-0 xl:gap-2 items-start xs:items-center sm:items-start xl:items-center"
            >
              <span class="text-standards-gray-midnight text-base font-semibold"
                >Laatst ingelogd:</span
              >
              <span class="text-standards-gray-dark text-sm">{{
                lastLogin
              }}</span>
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
          <usersSecurity
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

export default {
  setup(props, context) {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();
    const generalStore = useGeneralStore();
    const router = useRouter();

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
    const showAccountTypeDropdown = ref(false);
    const selectedAccountType = ref(null);
    const selectedAccountTypeDisplay = ref(null);
    const isLoading = ref(false);
    const accountTypes = ref([]);
    const selectedTab = ref("security");

    const user = computed(() => generalStore.GET_SHOW_USER_PROFILE);

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

    const toggleTab = (e) => {
      selectedTab.value = e;
      const el = document.getElementById(selectedTab.value);
      // TODO: not working somehow
      if (el) {
        el.scrollIntoView();
      }
    };

    const getInitials = (user) => {
      let plainLastname;
      if (user.lastname && user.lastname != "") {
        const allLastnames = user.lastname.split(" ");
        const lastIndex = allLastnames.length - 1;
        plainLastname = allLastnames[lastIndex];
      }
      if (
        user.firstname &&
        user.firstname != "" &&
        plainLastname &&
        plainLastname != ""
      ) {
        return user.firstname.slice(0, 1) + plainLastname.slice(0, 1);
      } else if (
        user.firstname &&
        user.firstname != "" &&
        (!plainLastname || plainLastname == "")
      ) {
        return user.firstname.slice(0, 2);
      } else if (
        plainLastname &&
        plainLastname != "" &&
        (!user.firstname || user.firstname == "")
      ) {
        return plainLastname.slice(0, 2);
      } else {
        return user.email.slice(0, 2);
      }
    };

    const getAllAccountTypes = async () => {
      await $fetch("/api/getAccountTypes", {
        method: "post",
        body: $authDirect(),
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          accountTypes.value = returnBody;
        }
      });
    };

    const setAccountType = (type) => {
      showAccountTypeDropdown.value = false;
      selectedAccountType.value = type;
      selectedAccountTypeDisplay.value = type.display;
      editUser.value.accountType = type;
    };

    const cancelUpdate = () => {
      showEditBox.value = false;
    };

    const updateUser = async () => {
      error.value.errorName = null;
      error.value.errorMessage = "";
      error.value.errorType = null;

      if (user.value.email == "") {
        error.value.errorName = "emailError";
        error.value.errorMessage = "Vul aub een email in";
        error.value.errorType = "error";
        return;
      }

      if (!selectedAccountType.value) {
        error.value.errorName = "accounttypeError";
        error.value.errorMessage = "Kies een accounttype";
        error.value.errorType = "error";
        return;
      }

      await $fetch("/api/updateUser", {
        method: "post",
        body: {
          auth: $authDirect(),
          currentUser: user.value,
          submission: {
            id: user.value.id,
            email: editUser.value.email,
            firstname: editUser.value.firstname,
            lastname: editUser.value.lastname,
            role: selectedAccountType.value,
          },
        },
      }).then(async (res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
        showEditBox.value = false;

        user.value.email = editUser.value.email;
        user.value.firstname = editUser.value.firstname;
        user.value.lastname = editUser.value.lastname;
        user.value.accountType = selectedAccountType.value;
        user.value.accountTypeId = selectedAccountType.value.id;
      });
    };

    onBeforeMount(async () => {
      if (!user.value) {
        router.push("/gebruikers");
      }
      await getAllAccountTypes();
    });

    onMounted(() => {
      if (user.value) {
        selectedAccountType.value = user.value.accountType;
        selectedAccountTypeDisplay.value = user.value.accountType.display;
        editUser.value.firstname = user.value.firstname;
        editUser.value.lastname = user.value.lastname;
        editUser.value.email = user.value.email;
      }
    });

    return {
      user,
      memberSince,
      lastLogin,
      showEditBox,
      error,
      showAccountTypeDropdown,
      selectedAccountType,
      selectedAccountTypeDisplay,
      isLoading,
      accountTypes,
      setAccountType,
      updateUser,
      cancelUpdate,
      editUser,
      toggleTab,
      selectedTab,
      getInitials,
    };
  },
};
</script>

<style lang="scss" scoped>
</style>