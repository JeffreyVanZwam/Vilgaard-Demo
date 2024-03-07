<template>
  <section class="">
    <generalConfirmDialog
      class="z-9882"
      v-if="dialogOptions.show"
      @cancel="closeDialog"
      @confirm="confirmDeleteRoom"
      :options="dialogOptions"
    />
    <div
      class="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-9881 p-4"
      v-if="showEditModal"
    >
      <generalDarkOverlay @click="closeEditModal()" />
      <div
        class="bg-white dark:bg-black rounded-xl shadow-mainBlack dark:shadow-mainWhite p-4 z-9882"
      >
        <h1
          class="font-semibold uppercase mb-2 text-base md:text-lg text-gray-title dark:text-white relative"
        >
          {{ `Hernoem ${editedRoom.name}` }}
        </h1>
        <div class="relative flex items-center w-full gap-2">
          <input
            type="text"
            v-model="editedRoomNew"
            placeholder="Nieuwe zaalnaam"
            id="newRoomName"
            class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
            :class="
              error.errorName != 'newRoomNameError'
                ? 'border-standards-gray-label text-standards-gray-label'
                : ' border-red-400 text-red-400'
            "
            required
          />
          <label
            for="newRoomName"
            class="absolute left-2 transition-all cursor-pointer"
            :class="
              error.errorName != 'newRoomNameError'
                ? ' text-standards-gray-label'
                : ' text-red-400'
            "
            >Nieuwe zaalnaam</label
          >
          <Icon
            name="solar:hourglass-broken"
            class="h-8 w-8 min-w-8 text-palettes-theme-primary dark:text-palettes-theme-white hourglass"
            v-if="isLoading"
          />
          <Icon
            v-else
            @click="editRoomName"
            name="solar:check-square-bold-duotone"
            class="h-8 w-8 min-h-8 min-w-8 text-palettes-theme-primary cursor-pointer"
          />
        </div>
      </div>
    </div>
    <div
      class="bg-white dark:bg-black rounded-xl shadow-mainBlack dark:shadow-mainWhite p-4 col-span-1 xs:col-span-3 lg:col-span-4"
    >
      <h1
        class="font-semibold uppercase my-4 text-lg md:text-xl text-gray-title dark:text-white relative"
      >
        Zalen
      </h1>
      <div
        class="bg-white dark:bg-black w-full mb-4 gap-4 grid grid-cols-1 dropzone min-h-5"
      >
        <draggable
          v-model="rooms"
          tag="ul"
          :animation="300"
          item-key="id"
          @end="endDrag"
        >
          <template #item="{ element: room }">
            <li
              class="flex flex-col justify-between items-start bg-white dark:bg-black p-4 w-full rounded-xl shadow-mainBlack dark:shadow-mainWhite relative"
            >
              <div class="w-full flex justify-between items-center gap-2">
                <h2 class="font-medium text-lg text-gray-title dark:text-white">
                  {{ room.name }}
                </h2>
                <div class="flex items-center gap-2">
                  <icon
                    name="solar:reorder-bold-duotone"
                    class="transform rotate-90 text-standards-gray-label dark:text-palettes-theme-white hover:text-palettes-theme-accent-hover dark:hover:text-palettes-theme-accent-hover transition-all cursor-move h-5 w-5"
                  />
                  <icon
                    v-if="
                      hasAccessToComponent('calendar_roomSettings_editRoom')
                    "
                    @click="openEditModal(room)"
                    name="solar:pen-new-square-line-duotone"
                    class="text-standards-gray-label dark:text-white dark:hover:text-palettes-theme-accent-hover hover:text-palettes-theme-accent-hover transition-all cursor-pointer h-5 w-5"
                  />
                  <icon
                    v-if="
                      hasAccessToComponent('calendar_roomSettings_deleteRoom')
                    "
                    @click="toggleDeleteConfirm(room)"
                    name="solar:trash-bin-trash-line-duotone"
                    class="text-standards-gray-label dark:text-white dark:hover:text-palettes-theme-accent-hover hover:text-palettes-theme-accent-hover transition-all cursor-pointer h-5 w-5"
                  />
                </div>
              </div>
            </li>
          </template>
        </draggable>

        <div
          v-if="hasAccessToComponent('calendar_roomSettings_createRoom')"
          class="flex flex-col justify-between items-start bg-white dark:bg-black p-4 w-full rounded-xl shadow-mainBlack dark:shadow-mainWhite relative order-1 sm:order-2"
        >
          <div class="w-full flex items-center justify-between gap-2">
            <div class="w-full">
              <div class="relative flex items-center w-full">
                <input
                  type="text"
                  v-model="newRoom"
                  placeholder="Nieuwe zaal"
                  id="room"
                  class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
                  :class="
                    error.errorName != 'roomError'
                      ? 'border-standards-gray-label text-standards-gray-label'
                      : ' border-red-400 text-red-400'
                  "
                  required
                />
                <label
                  for="room"
                  class="absolute left-2 transition-all cursor-pointer"
                  :class="
                    error.errorName != 'roomError'
                      ? ' text-standards-gray-label'
                      : ' text-red-400'
                  "
                  >Nieuwe zaal</label
                >
              </div>
              <p
                v-if="error.errorName && error.errorName != '' && newRoom == ''"
                class="mt-2 text-red-400"
              >
                {{ error.errorMessage }}
              </p>
            </div>

            <Icon
              name="solar:hourglass-broken"
              class="h-8 w-8 min-w-8 text-palettes-theme-primary hourglass"
              v-if="isLoading"
            />
            <Icon
              v-else
              @click="addNewRoom"
              name="solar:add-square-bold-duotone"
              class="h-8 w-8 min-h-8 min-w-8 text-palettes-theme-primary cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useUserStore } from "@/store/user";
import { useGeneralStore } from "@/store/general";
import draggable from "vuedraggable";

export default {
  components: {
    draggable,
  },

  setup() {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();
    const userStore = useUserStore();
    const generalStore = useGeneralStore();

    const rooms = ref([]);
    const newRoom = ref("");
    const isLoading = ref(false);
    const error = ref({ errorName: null, errorMessage: "", errorType: null });
    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);
    const showEditModal = ref(false);
    const editedRoom = ref(null);
    const editedRoomNew = ref(null);
    const deleteID = ref("");
    const dialogOptions = ref({
      show: false,
      title: "",
      description: "",
      cancelText: "",
      confirmText: "",
    });

    const getAllRooms = async () => {
      await $fetch("/api/getRooms", {
        method: "post",
        body: { auth: $authDirect(), location: generalStore.GET_LOCATION },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          rooms.value = returnBody;
          rooms.value.sort((a, b) => {
            return a.position - b.position;
          });
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

    const endDrag = () => {
      rooms.value.forEach((room) => {
        room.position = rooms.value.indexOf(room) + 1;
      });
      updateRoomsOrder();
    };

    const addNewRoom = async () => {
      if (newRoom.value != "") {
        isLoading.value = true;
        await $fetch("/api/createRoom", {
          method: "post",
          body: {
            auth: $authDirect(),
            room: newRoom.value,
            location: generalStore.GET_LOCATION,
          },
        }).then(async (res) => {
          const returnBody = JSON.parse(res.body);
          isLoading.value = false;
          if (returnBody.snackbar) {
            snackbar.add(returnBody.snackbar);
            if (returnBody.snackbar.type == "success") {
              await getAllRooms();
              error.value.errorMessage = "";
              error.value.errorName = "";
              newRoom.value = "";
            }
          }
        });
      } else {
        error.value.errorName = "roomError";
        error.value.errorMessage = "Je hebt geen waarde ingevuld.";
      }
    };

    const toggleDeleteConfirm = (room) => {
      deleteID.value = room.id;
      dialogOptions.value.title = "Zaal verwijderen";
      dialogOptions.value.description = `Weet je zeker dat je de zaal "${room.name}" wilt verwijderen? Bestaande reserveringen voor deze zaal blijven hiermee behouden maar kunnen na bevestiging niet meer in de kalenderweergave getoond worden.`;
      dialogOptions.value.cancelText = "Annuleren";
      dialogOptions.value.confirmText = "Verwijderen";
      dialogOptions.value.show = true;
    };

    const openEditModal = (room) => {
      editedRoom.value = room;
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      editedRoom.value = "";
      editedRoomNew.value = "";
      showEditModal.value = false;
    };

    const confirmDeleteRoom = async () => {
      await $fetch("/api/deleteRoom", {
        method: "post",
        body: {
          auth: $authDirect(),
          room: deleteID.value,
        },
      }).then(async (res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
        getAllRooms();
        closeDialog();
      });
    };

    const editRoomName = async () => {
      await $fetch("/api/updateRoom", {
        method: "post",
        body: {
          auth: $authDirect(),
          currentRoom: editedRoom.value,
          newRoom: editedRoomNew.value,
        },
      }).then(async (res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
        getAllRooms();
        closeEditModal();
      });
    };

    const updateRoomsOrder = async () => {
      await $fetch("/api/updateRoomsOrder", {
        method: "post",
        body: {
          auth: $authDirect(),
          rooms: rooms.value,
        },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          rooms.value = returnBody;
        }
      });
    };

    const closeDialog = () => {
      deleteID.value = "";
      dialogOptions.value.title = "";
      dialogOptions.value.description = "";
      dialogOptions.value.cancelText = "";
      dialogOptions.value.confirmText = "";
      dialogOptions.value.show = false;
    };

    watch(
      () => generalStore.GET_LOCATION,
      async (n) => {
        if (n && hasAccessToComponent("calendar_roomSettings_showRooms")) {
          await getAllRooms();
        }
      }
    );

    onBeforeMount(async () => {
      if (
        generalStore.GET_LOCATION &&
        hasAccessToComponent("calendar_roomSettings_showRooms")
      ) {
        await getAllRooms();
      }
    });

    return {
      rooms,
      hasAccessToComponent,
      newRoom,
      error,
      endDrag,
      addNewRoom,
      isLoading,
      toggleDeleteConfirm,
      dialogOptions,
      closeDialog,
      confirmDeleteRoom,
      showEditModal,
      openEditModal,
      closeEditModal,
      editedRoom,
      editedRoomNew,
      editRoomName,
    };
  },
};
</script>

<style scoped>
</style>