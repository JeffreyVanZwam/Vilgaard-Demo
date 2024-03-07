<template>
  <div class="">
    <section class="relative" v-if="authIsReady">
      <generalConfirmDialog
        class="z-9881"
        v-if="dialogOptions.show"
        @cancel="closeDialog"
        @confirm="confirmDelete"
        :options="dialogOptions"
      />
      <usersAddAdmin
        @closeOverlay="closeAdminBar()"
        @updateList="updateList()"
        :accountTypes="accountTypes"
        class="transform transition-all z-9881 top-0 shadow-mainBlack dark:shadow-mainWhite fixed"
        :class="showNewAdminBar ? 'right-0' : '-right-full'"
      />

      <div
        class="bg-white dark:bg-black rounded-xl shadow-mainBlack dark:shadow-mainWhite p-4"
      >
        <h1
          class="font-semibold uppercase my-8 text-lg md:text-xl text-gray-title dark:text-white relative z-1000"
        >
          Dashboard gebruikers
        </h1>
        <div
          v-if="hasAccessToComponent('userManagement_adminAccess_showAdmins')"
          class="flex justify-between items-center bg-white-full p-4 w-full rounded-xl shadow-mainBlack dark:shadow-mainWhite mb-4 sticky top-24 z-1002"
        >
          <div class="flex gap-4 items-center w-full justify-between">
            <div class="w-full relative flex items-center">
              <input
                type="text"
                id="search"
                v-model="adminUsername"
                placeholder="Zoek gebruiker"
                class="rounded-xl p-2 text-sm sm:text-base focus:outline-0 outline-none font-light w-full topSearchbar inputfield"
              />
              <label
                for="search"
                class="absolute left-2 transition-all text-gray-light cursor-pointer"
                >Zoek gebruiker</label
              >
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-black w-full rounded-xl shadow-mainBlack dark:shadow-mainWhite mb-4"
        >
          <div class="p-4">
            <span
              class="font-medium text-lg md:text-xl text-gray-title dark:text-white block py-4 md:py-6"
              >Filter</span
            >

            <div class="flex flex-col sm:flex-row justify-start gap-4">
              <!-- Filter on accountType -->
              <div class="w-full sm:w-1/3 relative flex items-center">
                <input
                  type="text"
                  name="role"
                  id="role"
                  class="w-full text-gray-light rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
                  v-model="selectedAccountTypeFilterDisplay"
                  placeholder="accounttype"
                  @click="showAccountTypeDropdown = true"
                />
                <label
                  for="role"
                  class="absolute left-2 transition-all cursor-pointer"
                  @click="showAccountTypeDropdown = true"
                  >Account type</label
                >
                <div
                  class="w-full absolute left-0 top-12 bg-white rounded-md border-opacity-80 text-palettes-theme-gray border border-gray-light border-standards-gray-dark py-2 z-30"
                  v-if="showAccountTypeDropdown"
                >
                  <div
                    class="cursor-pointer px-4 py-2 hover:bg-green-mid hover:bg-opacity-10 transition-all"
                    v-for="(type, i) in accountTypes"
                    :key="type.type"
                    @click="setAccountTypeFilter(type)"
                  >
                    {{ type.display }}
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="right-4 absolute h-6 fill-gray-light cursor-pointer"
                  @click="
                    (selectedAccountTypeFilterDisplay = null),
                      (selectedAccountTypeFilterValue = null)
                  "
                  v-if="
                    selectedAccountTypeFilterValue != '' &&
                    selectedAccountTypeFilterValue != null
                  "
                  viewBox="0 0 24 24"
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <hr
            class="bg-standards-gray-light dark:bg-palettes-theme-black h-1 w-full mt-4"
          />

          <div class="p-4">
            <div class="flex justify-between gap-4">
              <select
                name="pagesize"
                id="pagesize"
                class="w-max border-opacity-80 opacity-80 text-gray-light border border-gray-light rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer"
                v-model="pagesize"
                @change="setLimit()"
              >
                <option
                  v-for="i in limits"
                  :key="i"
                  class="opacity-100 text-gray-title hover:bg-green-500"
                >
                  {{ i }}
                </option>
              </select>
              <div class="flex gap-4 items-center">
                <button
                  v-if="
                    hasAccessToComponent(
                      'userManagement_adminAccess_createAccount'
                    )
                  "
                  class="bg-palettes-theme-primary rounded-full sm:rounded-lg uppercase flex items-center justify-center cursor-pointer text-white-full font-medium text-sm sm:px-5 w-9.5 sm:w-auto h-9.5 gap-2"
                  @click="toggleNewAdmin()"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    enable-background="new 0 0 24 24"
                    class="fill-current h-6"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  <span class="uppercase hidden sm:block"
                    >Nieuwe gebruiker</span
                  >
                </button>
              </div>
            </div>
          </div>

          <hr class="background-gray-light h-1 w-full" />

          <div
            v-if="hasAccessToComponent('userManagement_adminAccess_showAdmins')"
          >
            <div class="hidden sm:block">
              <div class="p-4 flex justify-between w-full">
                <span
                  class="text-standards-gray-dark dark:text-white uppercase text-xs font-bold w-3/5"
                  >Gebruiker</span
                >
                <span
                  class="text-standards-gray-dark dark:text-white uppercase text-xs font-bold w-1/5"
                  >Account</span
                >
                <span
                  v-if="
                    hasAccessToComponent(
                      'userManagement_adminAccess_editAdmins'
                    )
                  "
                  class="text-standards-gray-dark dark:text-white uppercase text-xs font-bold w-1/5"
                  >Opties</span
                >
              </div>
            </div>

            <hr
              class="bg-standards-gray-light dark:bg-palettes-theme-black h-px w-full hidden sm:block"
            />

            <div
              class="divide-y divide-gray-light dark:divide-palettes-theme-black divide-opacity-50"
            >
              <div
                class=""
                v-for="(user, index) in paginate(
                  filteredAdmins,
                  pagesize,
                  pagenumber
                )"
                :key="user.id"
              >
                <div class="px-4 py-1 flex gap-2 items-center justify-between">
                  <div
                    class="flex items-center justify-start w-4/5 sm:w-3/5 overflow-hidden"
                  >
                    <div
                      class="flex items-center justify-start gap-2"
                      @click="showOptions(user)"
                    >
                      <div
                        class="rounded-full bg-palettes-theme-primary text-white-full flex items-center justify-center w-8 h-8 sm:w-9.5 sm:h-9.5 uppercase text-sm sm:text-base"
                      >
                        <span>{{ getInitials(user) }}</span>
                      </div>
                      <div class="flex flex-col">
                        <div
                          class="text-palettes-theme-gray dark:text-palettes-theme-white font-medium flex gap-1 text-sm sm:text-base"
                          v-if="user.firstname || user.lastname"
                        >
                          <span v-if="user.firstname">{{
                            user.firstname
                          }}</span>
                          <span v-if="user.lastname">{{ user.lastname }}</span>
                        </div>

                        <span
                          class="text-gray-span dark:text-white text-xs sm:text-sm"
                        >
                          {{ user.email }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="w-1/5 hidden sm:flex gap-1">
                    <span
                      class="rounded-full text-sm py-0.5 px-3"
                      :style="`background-color:${user.accountType.backgroundColor};color:${user.accountType.textColor}`"
                    >
                      {{ user.accountType.display }}
                    </span>
                  </div>
                  <div
                    class="w-1/5 flex gap-1 bg-white dark:bg-black"
                    v-if="
                      hasAccessToComponent(
                        'userManagement_adminAccess_editAdmins'
                      )
                    "
                  >
                    <Icon
                      name="solar:pen-broken"
                      class="h-5 w-5 cursor-pointer text-gray-title dark:text-white hover:text-palettes-theme-secondary dark:hover:text-palettes-theme-secondary transition-all"
                      @click="editUser(user)"
                    />

                    <Icon
                      name="solar:trash-bin-minimalistic-broken"
                      class="h-5 w-5 cursor-pointer text-gray-title dark:text-white hover:text-palettes-theme-secondary dark:hover:text-palettes-theme-secondary transition-all"
                      @click="toggleDelete(user)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr class="background-gray-light h-1 w-full" />

            <div class="flex flex-col sm:flex-row justify-between px-2 py-1">
              <div class="flex justify-start items-center">
                <span
                  class="text-gray-light text-xs sm:text-base opacity-80 px-4"
                  >{{ calcShownUsersData }}</span
                >
              </div>
              <div class="flex justify-end items-center">
                <div
                  class="rounded-md shadow-mainBlack dark:shadow-mainWhite h-8 w-8 shrink-0 flex items-center justify-center m-1 last:mr-0 transition-all cursor-pointer"
                  :class="
                    page == pagenumber
                      ? ' bg-palettes-theme-accent bg-opacity-20 text-palettes-theme-gray'
                      : 'bg-gray-main-background text-gray-title '
                  "
                  v-for="(page, i) in pages"
                  @click="setPagination(page)"
                  :key="i"
                >
                  {{ page }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "@/store/user";
import { useGeneralStore } from "@/store/general";

export default {
  setup() {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();
    const userStore = useUserStore();
    const router = useRouter();
    const generalStore = useGeneralStore();

    const currentLoggedInUser = ref(null);
    const authIsReady = ref(false);
    const showNewAdminBar = ref(false);
    const adminUsername = ref("");
    const pagesize = ref(10);
    const pagenumber = ref(1);
    const pages = ref(null);
    const limits = [5, 10, 20, 25, 50, 100];
    const admins = ref([]);
    const showAccountTypeDropdown = ref(false);
    const selectedAccountTypeFilterValue = ref(null);
    const selectedAccountTypeFilterDisplay = ref(null);
    const accountTypes = ref([]);
    const deleteUser = ref(null);
    const dialogOptions = ref({
      show: false,
      title: "",
      description: "",
      cancelText: "",
      confirmText: "",
    });

    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);
    const filteredAdmins = computed(() => {
      let newArray = filterAdminUsersByRole(filterAdminUsersByName(admins));

      pages.value = Math.ceil(newArray.length / pagesize.value);

      if (process.client) {
        if (localStorage.getItem("adminSuperusersPagination")) {
          if (
            localStorage.getItem("adminSuperusersPagination") <= pages.value
          ) {
            pagenumber.value = localStorage.getItem(
              "adminSuperusersPagination"
            );
          } else {
            pagenumber.value = pages.value;
          }
        }
      }

      return newArray;
      // return newArray.slice(0, this.pagesize);
    });

    const setAccountTypeFilter = (type) => {
      showAccountTypeDropdown.value = false;
      selectedAccountTypeFilterValue.value = type.name;
      selectedAccountTypeFilterDisplay.value = type.display;
    };

    const closeDialog = () => {
      dialogOptions.value.title = "";
      dialogOptions.value.description = "";
      dialogOptions.value.cancelText = "";
      dialogOptions.value.confirmText = "";
      dialogOptions.value.show = false;
      deleteUser.value = null;
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

    const calcShownUsersData = computed(() => {
      let first, last, total;
      total = filteredAdmins.value.length;
      if (pagenumber.value == 1) {
        first = 1;
      } else {
        first = 1 + (pagenumber.value - 1) * pagesize.value;
      }
      if (pagenumber.value == pages.value) {
        last = total;
      } else {
        last = first - 1 + Number(pagesize.value);
      }
      if (first < 0) {
        first = 0;
      }
      return `Toon ${first} tot ${last} van ${total} gebruiker${
        total == 1 ? "" : "s"
      }`;
    });

    const filterAdminUsersByRole = (admins) => {
      return admins.filter((admin) => {
        if (selectedAccountTypeFilterValue.value != null) {
          return admin.accountType.name == selectedAccountTypeFilterValue.value;
        } else {
          return true;
        }
      });
    };

    const filterAdminUsersByName = (admins) => {
      return admins.value.filter((admin) => {
        if (adminUsername.value != "") {
          return (
            admin.email
              .toLowerCase()
              .includes(adminUsername.value.toLowerCase()) ||
            admin.firstname
              .toLowerCase()
              .includes(adminUsername.value.toLowerCase()) ||
            admin.lastname
              .toLowerCase()
              .includes(adminUsername.value.toLowerCase())
          );
        } else {
          return true;
        }
      });
    };

    const hasAccessToComponent = (rightName) => {
      let value = false;
      userRights.value.map((right) => {
        if (right.name == rightName) {
          value = true;
        }
      });
      return value;
    };

    const toggleNewAdmin = () => {
      showNewAdminBar.value = true;
      generalStore.HIDE_MENU_BTN();
    };

    const closeAdminBar = () => {
      showNewAdminBar.value = false;
      generalStore.SHOW_MENU_BTN();
    };

    const updateList = () => {
      getAdminUsers();
    };

    const paginate = (array, pageSize, pageNumber) => {
      return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    };

    const setLimit = () => {
      localStorage.setItem("adminSuperusersPaginationLimit", pagesize.value);
      setPagination(1);
    };

    const setPagination = (page) => {
      localStorage.setItem("adminSuperusersPagination", page);
      pagenumber.value = page;
    };

    const getAdminUsers = async () => {
      await $fetch("/api/getAdminUsers", {
        method: "post",
        body: $authDirect(),
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          admins.value = returnBody;
        }
      });
    };

    const editUser = (user) => {
      generalStore.SET_USER_PROFILE(user);
      if (user.id == currentLoggedInUser.value.uid) {
        router.push("/profiel");
      } else {
        router.push("/gebruiker");
      }
    };

    const toggleDelete = (user) => {
      dialogOptions.value.title = "Dashboard gebruiker verwijderen";
      dialogOptions.value.description = `Weet je zeker dat je het gebruikersaccount '${user.email}' wilt verwijderen? Hiermee wordt de gebruiker permanent uit de database verwijderd.`;
      dialogOptions.value.cancelText = "Annuleren";
      dialogOptions.value.confirmText = "Verwijderen";
      dialogOptions.value.show = true;
      deleteUser.value = user;
    };

    const confirmDelete = async () => {
      await $fetch("/api/deleteDashboardUser", {
        method: "post",
        body: {
          auth: $authDirect(),
          user: deleteUser.value,
        },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }

        closeDialog();
        getAdminUsers();
      });
    };

    onBeforeMount(() => {
      if (localStorage.getItem("adminSuperusersPaginationLimit")) {
        pagesize.value = localStorage.getItem("adminSuperusersPaginationLimit");
      }
    });

    onBeforeMount(async () => {
      if (hasAccessToComponent("userManagement_adminAccess_showAdmins")) {
        getAdminUsers();
      }
    });

    onBeforeMount(async () => {
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
    });

    onMounted(() => {
      onAuthStateChanged($authDirect(), (newUser) => {
        currentLoggedInUser.value = newUser;
        authIsReady.value = true;
      });
    });

    return {
      adminUsername,
      pagesize,
      limits,
      setLimit,
      setPagination,
      hasAccessToComponent,
      toggleNewAdmin,
      showNewAdminBar,
      closeAdminBar,
      paginate,
      filteredAdmins,
      pagenumber,
      updateList,
      getAdminUsers,
      calcShownUsersData,
      pages,
      selectedAccountTypeFilterDisplay,
      selectedAccountTypeFilterValue,
      showAccountTypeDropdown,
      setAccountTypeFilter,
      accountTypes,
      editUser,
      toggleDelete,
      dialogOptions,
      closeDialog,
      confirmDelete,
      authIsReady,
      getInitials,
    };
  },
};
</script>

<style>
</style>