<template>
  <section>
    <generalConfirmDialog
      class="z-9882"
      v-if="dialogOptions.show"
      @cancel="closeDialog"
      @confirm="confirmDeleteLocation"
      :options="dialogOptions"
    />
    <div
      class="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-9881 p-4"
      v-if="showEditModal"
    >
      <generalDarkOverlay @click="closeEditModal()" />
      <div
        class="bg-white dark:bg-black rounded-xl shadow-mainBlack dark:shadow-mainWhite p-4 z-9882 flex flex-col items-end gap-4"
      >
        <div class="flex flex-col sm:flex-row gap-6 justify-start items-start">
          <div class="w-full">
            <h1
              class="font-semibold uppercase mb-2 text-md md:text-base text-gray-title dark:text-white relative"
            >
              {{ `Hernoem ${editedLocation.name}` }}
            </h1>
            <div class="relative flex items-center w-full gap-2">
              <input
                type="text"
                v-model="editedLocationNew"
                placeholder="Nieuwe locatienaam"
                id="newLocationName"
                class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
                :class="
                  error.errorName != 'newLocationNameError'
                    ? 'border-standards-gray-label text-standards-gray-label'
                    : ' border-red-400 text-red-400'
                "
                required
              />
              <label
                for="newLocationName"
                class="absolute left-2 transition-all cursor-pointer"
                :class="
                  error.errorName != 'newLocationNameError'
                    ? ' text-standards-gray-label'
                    : ' text-red-400'
                "
                >Nieuwe locatienaam</label
              >
            </div>
            <h1
              class="font-semibold uppercase mb-2 mt-4 text-md md:text-base text-gray-title dark:text-white relative"
            >
              Feeds
            </h1>
            <div class="" v-for="feed in feeds" :key="feed.name">
              <div
                class="w-full border-standards-gray-label text-palettes-theme-gray dark:text-palettes-theme-white rounded-md focus:outline-0 flex items-center gap-2 cursor-pointer"
                @click="toggleEditedFeed(feed)"
              >
                <div
                  class="flex items-center justify-center w-5 h-5 rounded-md bg-gray-100 dark:bg-palettes-theme-blackForm"
                >
                  <icon
                    name="solar:check-read-line-duotone"
                    v-if="editedSelectedFeeds.includes(feed)"
                    class="h-5 w-5 text-palettes-theme-primary"
                  />
                </div>
                <span class="capitalize">
                  {{ feed.name }}
                </span>
              </div>
            </div>
          </div>
          <div class="w-full min-w-max">
            <h1
              class="font-semibold uppercase mb-2 text-md md:text-base text-gray-title relative"
            >
              Beheer toegang tot locatie
            </h1>
            <div class="flex items-start gap-4 w-full">
              <ul
                class="w-full border-standards-gray-label bg-gray-100 dark:bg-palettes-theme-blackForm text-palettes-theme-gray dark:text-palettes-theme-white rounded-md p-2 focus:outline-0"
              >
                <li
                  v-for="user in users"
                  :key="user.email"
                  class="flex items-center gap-2 cursor-pointer"
                  @click="grantUserToLocation(user)"
                >
                  <div
                    class="flex items-center justify-center w-5 h-5 rounded-md bg-white dark:bg-palettes-theme-black"
                  >
                    <icon
                      name="solar:check-read-line-duotone"
                      v-if="selectedUsers.includes(user)"
                      class="h-5 w-5 text-palettes-theme-primary"
                    />
                  </div>
                  {{ `${user.firstname} ${user.lastname}` }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- Errors -->
        <p
          v-if="
            error.errorName == 'newLocationNameError' && editedLocationNew == ''
          "
          class="mt-2 text-red-400 self-start"
        >
          {{ error.errorMessage }}
        </p>
        <!-- BTN's -->
        <div class="relative flex items-center gap-4 select-none">
          <button
            @click="updateLocation()"
            class="bg-palettes-theme-primary rounded-lg text-white-full uppercase transform transition-all font-medium text-sm px-5 h-9.5"
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
          <div
            @click="closeEditModal()"
            class="bg-standards-gray-label rounded-lg text-palettes-theme-gray uppercase font-medium text-sm px-5 h-9.5 flex items-center cursor-pointer"
          >
            Annuleren
          </div>
        </div>
      </div>
    </div>

    <div class="relative grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-4">
      <section
        class="bg-white dark:bg-black rounded-xl shadow-mainBlack dark:shadow-mainWhite overflow-hidden p-4 col-span-1 sm:col-span-2 lg:col-span-2"
      >
        <h1
          class="font-semibold uppercase my-4 text-lg md:text-xl text-gray-title dark:text-palettes-theme-white relative"
        >
          Locaties
        </h1>
        <ul class="mb-4">
          <li
            v-for="location in locations"
            :key="location.name"
            class="flex flex-col justify-between items-start bg-white-full p-4 w-full rounded-xl shadow-mainBlack dark:shadow-mainWhite relative"
          >
            <div class="w-full flex justify-between items-center gap-2">
              <h2
                class="font-medium text-lg text-gray-title dark:text-palettes-theme-white"
              >
                {{ location.name }}
              </h2>
              <div class="flex items-center gap-2">
                <icon
                  v-if="
                    hasAccessToComponent(
                      'generalSettings_locations_editLocations'
                    )
                  "
                  @click="openEditModal(location)"
                  name="solar:pen-new-square-line-duotone"
                  class="text-standards-gray-label dark:text-white hover:text-palettes-theme-accent-hover dark:hover:text-palettes-theme-accent-hover transition-all cursor-pointer h-5 w-5"
                />
                <icon
                  v-if="
                    hasAccessToComponent(
                      'generalSettings_locations_deleteLocations'
                    )
                  "
                  @click="toggleDeleteConfirm(location)"
                  name="solar:trash-bin-trash-line-duotone"
                  class="text-standards-gray-label dark:text-white hover:text-palettes-theme-accent-hover dark:hover:text-palettes-theme-accent-hover transition-all cursor-pointer h-5 w-5"
                />
              </div>
            </div>
          </li>
        </ul>
        <div
          v-if="
            hasAccessToComponent('generalSettings_locations_createLocation')
          "
          class="flex flex-col justify-between items-start bg-white dark:bg-black p-4 w-full rounded-xl shadow-mainBlack dark:shadow-mainWhite relative order-1 sm:order-2"
        >
          <div class="w-full flex items-center justify-between gap-2">
            <div class="w-full">
              <div class="relative flex items-center w-full">
                <input
                  type="text"
                  v-model="newLocation"
                  placeholder="Nieuwe locatie"
                  id="location"
                  class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
                  :class="
                    error.errorName != 'locationError'
                      ? 'border-standards-gray-label text-standards-gray-label'
                      : ' border-red-400 text-red-400'
                  "
                  required
                />
                <label
                  for="location"
                  class="absolute left-2 transition-all cursor-pointer"
                  :class="
                    error.errorName != 'locationError'
                      ? ' text-standards-gray-label'
                      : ' text-red-400'
                  "
                  >Nieuwe locatie</label
                >
              </div>
            </div>
          </div>
          <div
            class="overflow-hidden transition-all duration-500 flex col-4 justify-between items-end xs:items-center w-full"
            :class="newLocation == '' ? 'max-h-0' : ' max-h-20'"
          >
            <div class="flex items-end gap-4 justify-between mt-2 w-full">
              <div class="">
                <span class="font-semibold text-sm"
                  >Exporteer naar feed(s):</span
                >
                <div class="flex flex-col gap-0">
                  <div
                    class="flex gap-2 items-center cursor-pointer"
                    v-for="feed in feeds"
                    :key="feed.name"
                    @click="toggleFeed(feed)"
                  >
                    <div
                      class="flex items-center justify-center w-5 h-5 rounded-md bg-gray-100 dark:bg-palettes-theme-blackForm"
                    >
                      <icon
                        name="solar:check-read-line-duotone"
                        v-if="selectedFeeds.includes(feed)"
                        class="h-5 w-5 text-palettes-theme-primary"
                      />
                    </div>
                    <span class="capitalize">{{ feed.name }}</span>
                  </div>
                </div>
              </div>
              <Icon
                name="solar:hourglass-broken"
                class="h-8 w-8 min-w-8 text-palettes-theme-primary hourglass"
                v-if="isLoading"
              />
              <Icon
                v-else
                @click="addNewLocation"
                name="solar:add-square-bold-duotone"
                class="h-8 w-8 min-h-8 min-w-8 text-palettes-theme-primary cursor-pointer"
              />
            </div>
          </div>
        </div>
        <p
          v-if="
            error.errorName != '' &&
            error.errorName != 'newLocationNameError' &&
            newLocation == ''
          "
          class="mt-2 text-red-400 e"
        >
          {{ error.errorMessage }}
        </p>
      </section>
    </div>
  </section>
</template>

<script>
import { useUserStore } from "@/store/user";

export default {
  setup() {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();
    const userStore = useUserStore();

    const locations = ref([]);
    const feeds = ref([]);
    const newLocation = ref("");
    const users = ref([]);
    const selectedUsers = ref([]);
    const selectedFeeds = ref([]);
    const isLoading = ref(false);
    const error = ref({ errorName: null, errorMessage: "", errorType: null });
    const showEditModal = ref(false);
    const editedSelectedFeeds = ref([]);
    const editedLocation = ref(null);
    const editedLocationNew = ref(null);
    const deleteID = ref("");
    const dialogOptions = ref({
      show: false,
      title: "",
      description: "",
      cancelText: "",
      confirmText: "",
    });

    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);

    const getLocations = async () => {
      await $fetch("/api/getLocations", {
        method: "post",
        body: $authDirect(),
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          locations.value = returnBody;
        }
      });
    };

    const getFeeds = async () => {
      await $fetch("/api/getFeeds", {
        method: "post",
        body: $authDirect(),
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          feeds.value = returnBody;
        }
      });
    };

    const getUsers = async () => {
      await $fetch("/api/getAdminUsers", {
        method: "post",
        body: $authDirect(),
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          users.value = returnBody;
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

    const grantUserToLocation = (user) => {
      const i = selectedUsers.value.indexOf(user);
      if (i > -1) {
        selectedUsers.value.splice(i, 1);
      } else {
        selectedUsers.value.push(user);
      }
    };

    const toggleFeed = (feed) => {
      const i = selectedFeeds.value.indexOf(feed);
      if (i > -1) {
        selectedFeeds.value.splice(i, 1);
      } else {
        selectedFeeds.value.push(feed);
      }
    };

    const toggleEditedFeed = (feed) => {
      const i = editedSelectedFeeds.value.indexOf(feed);
      if (i > -1) {
        editedSelectedFeeds.value.splice(i, 1);
      } else {
        editedSelectedFeeds.value.push(feed);
      }
    };

    const addNewLocation = async () => {
      if (newLocation.value != "") {
        isLoading.value = true;
        await $fetch("/api/createLocation", {
          method: "post",
          body: {
            auth: $authDirect(),
            location: newLocation.value,
            feeds: selectedFeeds.value,
          },
        }).then(async (res) => {
          const returnBody = JSON.parse(res.body);
          isLoading.value = false;
          if (returnBody.snackbar) {
            snackbar.add(returnBody.snackbar);
            if (returnBody.snackbar.type == "success") {
              reloadNuxtApp();
            }
          }
        });
      } else {
        error.value.errorName = "locationError";
        error.value.errorMessage = "Je hebt geen waarde ingevuld.";
      }
    };

    const toggleDeleteConfirm = (location) => {
      deleteID.value = location.id;
      dialogOptions.value.title = "Locatie verwijderen";
      dialogOptions.value.description = `Weet je zeker dat je de locatie "${location.name}" wilt verwijderen? Bestaande reserveringen en zalen voor deze locatie blijven hiermee behouden maar kunnen na bevestiging niet meer in het dashboard getoond worden.`;
      dialogOptions.value.cancelText = "Annuleren";
      dialogOptions.value.confirmText = "Verwijderen";
      dialogOptions.value.show = true;
    };

    const openEditModal = (location) => {
      editedLocation.value = location;
      editedLocationNew.value = location.name;
      editedSelectedFeeds.value = feeds.value.filter((feed) => {
        let value = false;
        location.visibleInFeed.map((l) => {
          if (l.id == feed.id) {
            value = true;
          }
        });
        return value;
      });
      showEditModal.value = true;
      selectedUsers.value = users.value.filter((user) => {
        let value = false;
        user.canSeeLocations.map((l) => {
          if (l.name == location.name) {
            value = true;
          }
        });
        return value;
      });
    };

    const closeEditModal = () => {
      editedLocation.value = "";
      editedLocationNew.value = "";
      editedSelectedFeeds.value = [];
      showEditModal.value = false;
    };

    const confirmDeleteLocation = async () => {
      await $fetch("/api/deleteLocation", {
        method: "post",
        body: {
          auth: $authDirect(),
          location: deleteID.value,
        },
      }).then(async (res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
          if (returnBody.snackbar.type == "success") {
            reloadNuxtApp();
          }
        }
      });
    };

    const updateLocation = async () => {
      if (editedLocationNew.value && editedLocationNew.value != "") {
        isLoading.value = true;
        await $fetch("/api/updateLocation", {
          method: "post",
          body: {
            auth: $authDirect(),
            currentLocation: editedLocation.value,
            newLocation: editedLocationNew.value,
            users: selectedUsers.value,
            editedSelectedFeeds: editedSelectedFeeds.value,
          },
        }).then(async (res) => {
          const returnBody = JSON.parse(res.body);
          isLoading.value = false;
          if (returnBody.snackbar) {
            snackbar.add(returnBody.snackbar);
            if (returnBody.snackbar.type == "success") {
              reloadNuxtApp();
            }
          }
        });
      } else {
        error.value.errorName = "newLocationNameError";
        error.value.errorMessage = "Je hebt geen waarde ingevuld.";
      }
    };

    const closeDialog = () => {
      deleteID.value = "";
      dialogOptions.value.title = "";
      dialogOptions.value.description = "";
      dialogOptions.value.cancelText = "";
      dialogOptions.value.confirmText = "";
      dialogOptions.value.show = false;
    };

    onBeforeMount(async () => {
      await getLocations();
      if (hasAccessToComponent("generalSettings_feeds_showFeeds")) {
        await getFeeds();
      }
      if (hasAccessToComponent("userManagement_adminAccess_showAdmins")) {
        await getUsers();
      }
    });

    return {
      locations,
      feeds,
      hasAccessToComponent,
      openEditModal,
      closeEditModal,
      closeDialog,
      error,
      isLoading,
      dialogOptions,
      toggleDeleteConfirm,
      confirmDeleteLocation,
      newLocation,
      addNewLocation,
      showEditModal,
      editedLocation,
      updateLocation,
      editedLocationNew,
      users,
      grantUserToLocation,
      selectedUsers,
      selectedFeeds,
      editedSelectedFeeds,
      toggleFeed,
      toggleEditedFeed,
    };
  },
};
</script>

<style scoped>
</style>