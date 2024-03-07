<template>
  <section class="">
    <generalConfirmDialog
      class="z-9882"
      v-if="dialogOptions.show"
      @cancel="closeDialog"
      @confirm="confirmDeletePerk"
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
          {{ `Hernoem ${editedPerk.name}` }}
        </h1>
        <div class="relative flex items-center w-full gap-2">
          <input
            type="text"
            v-model="editedPerkNew"
            placeholder="Nieuw item"
            id="newPerkName"
            class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
            :class="
              error.errorName != 'newPerkNameError'
                ? 'border-standards-gray-label text-standards-gray-label'
                : ' border-red-400 text-red-400'
            "
            required
          />
          <label
            for="newPerkName"
            class="absolute left-2 transition-all cursor-pointer"
            :class="
              error.errorName != 'newPerkNameError'
                ? ' text-standards-gray-label'
                : ' text-red-400'
            "
            >Nieuw item</label
          >
          <Icon
            name="solar:hourglass-broken"
            class="h-8 w-8 min-w-8 text-palettes-theme-primary hourglass"
            v-if="isLoading"
          />
          <Icon
            v-else
            @click="editPerkName"
            name="solar:check-square-bold-duotone"
            class="h-8 w-8 min-h-8 min-w-8 text-palettes-theme-primary cursor-pointer"
          />
        </div>
      </div>
    </div>
    <div
      v-if="hasAccessToComponent('calendar_roomSettings_showPerks')"
      class="bg-white dark:bg-black rounded-xl shadow-mainBlack dark:shadow-mainWhite p-4 col-span-1 xs:col-span-3 lg:col-span-4"
    >
      <h1
        class="font-semibold uppercase my-4 text-lg md:text-xl text-gray-title dark:text-white relative"
      >
        Benodigdheden
      </h1>
      <div
        class="bg-white dark:bg-black w-full mb-4 gap-4 grid grid-cols-1 dropzone min-h-5"
      >
        <draggable
          v-model="perks"
          tag="ul"
          :animation="300"
          item-key="id"
          @end="endDrag"
        >
          <template #item="{ element: perk }">
            <li
              class="flex flex-col justify-between items-start bg-white dark:bg-black p-4 w-full rounded-xl shadow-mainBlack dark:shadow-mainWhite relative"
            >
              <div class="w-full flex justify-between items-center gap-2">
                <h2 class="font-medium text-lg text-gray-title dark:text-white">
                  {{ perk.name }}
                </h2>
                <div class="flex items-center gap-2">
                  <icon
                    name="solar:reorder-bold-duotone"
                    class="transform rotate-90 text-standards-gray-label dark:text-white dark:hover:text-palettes-theme-accent-hover hover:text-palettes-theme-accent-hover transition-all cursor-move h-5 w-5"
                  />
                  <icon
                    v-if="
                      hasAccessToComponent('calendar_roomSettings_editPerk')
                    "
                    @click="openEditModal(perk)"
                    name="solar:pen-new-square-line-duotone"
                    class="text-standards-gray-label dark:text-white dark:hover:text-palettes-theme-accent-hover hover:text-palettes-theme-accent-hover transition-all cursor-pointer h-5 w-5"
                  />
                  <icon
                    v-if="
                      hasAccessToComponent('calendar_roomSettings_deletePerk')
                    "
                    @click="toggleDeleteConfirm(perk)"
                    name="solar:trash-bin-trash-line-duotone"
                    class="text-standards-gray-label dark:text-white dark:hover:text-palettes-theme-accent-hover hover:text-palettes-theme-accent-hover transition-all cursor-pointer h-5 w-5"
                  />
                </div>
              </div>
            </li>
          </template>
        </draggable>

        <div
          v-if="hasAccessToComponent('calendar_roomSettings_createPerk')"
          class="flex flex-col justify-between items-start bg-white dark:bg-black p-4 w-full rounded-xl shadow-mainBlack dark:shadow-mainWhite relative order-1 sm:order-2"
        >
          <div class="w-full flex items-center justify-between gap-2">
            <div class="w-full">
              <div class="relative flex items-center w-full">
                <input
                  type="text"
                  v-model="newPerk"
                  placeholder="Nieuwe toevoegen"
                  id="perk"
                  class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
                  :class="
                    error.errorName != 'perkError'
                      ? 'border-standards-gray-label text-standards-gray-label'
                      : ' border-red-400 text-red-400'
                  "
                  required
                />
                <label
                  for="perk"
                  class="absolute left-2 transition-all cursor-pointer"
                  :class="
                    error.errorName != 'perkError'
                      ? ' text-standards-gray-label'
                      : ' text-red-400'
                  "
                  >Nieuwe toevoegen</label
                >
              </div>
              <p
                v-if="error.errorName && error.errorName != '' && newPerk == ''"
                class="text-red-400"
                :class="
                  error.errorName != '' && newPerk == '' ? 'mt-2 ' : 'mt-0'
                "
              >
                {{ error.errorMessage }}
              </p>
            </div>
            <div class="flex items-center gap-1">
              <icon
                name="solar:clipboard-remove-line-duotone"
                class="w-5 h-5 text-standards-gray-midnight dark:text-standards-gray-mid cursor-pointer"
                @click="hasCustomAmount = false"
              />
              <div
                class="relative flex items-center cursor-pointer"
                @click="hasCustomAmount = !hasCustomAmount"
              >
                <div
                  class="transition-all h-3.5 w-7 rounded-xl"
                  :class="
                    hasCustomAmount
                      ? ' bg-palettes-theme-secondary'
                      : 'bg-palettes-theme-gray dark:bg-palettes-theme-white'
                  "
                ></div>
                <div
                  class="transition-all h-4.5 w-4.5 rounded-full absolute"
                  :class="
                    hasCustomAmount
                      ? ' bg-palettes-theme-primary right-0'
                      : 'bg-palettes-theme-white dark:bg-palettes-theme-black right-3 shadow-mainBlack dark:shadow-mainWhite'
                  "
                ></div>
              </div>
              <icon
                name="solar:clipboard-add-line-duotone"
                class="w-5 h-5 text-standards-gray-midnight dark:text-standards-gray-mid cursor-pointer"
                @click="hasCustomAmount = true"
              />
            </div>

            <Icon
              name="solar:hourglass-broken"
              class="h-8 w-8 min-w-8 text-palettes-theme-primary hourglass"
              v-if="isLoading"
            />
            <Icon
              v-else
              @click="addNewPerk"
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

    const perks = ref([]);
    const newPerk = ref("");
    const isLoading = ref(false);
    const error = ref({ errorName: null, errorMessage: "", errorType: null });
    const showEditModal = ref(false);
    const editedPerk = ref(null);
    const editedPerkNew = ref(null);
    const deleteID = ref("");
    const hasCustomAmount = ref(false);
    const dialogOptions = ref({
      show: false,
      title: "",
      description: "",
      cancelText: "",
      confirmText: "",
    });

    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);

    const getAllPerks = async () => {
      await $fetch("/api/getPerks", {
        method: "post",
        body: { auth: $authDirect(), location: generalStore.GET_LOCATION },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          perks.value = returnBody;
          perks.value.sort((a, b) => {
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
      perks.value.forEach((perk) => {
        perk.position = perks.value.indexOf(perk) + 1;
      });
      updatePerksOrder();
    };

    const addNewPerk = async () => {
      if (newPerk.value != "") {
        isLoading.value = true;
        await $fetch("/api/createPerk", {
          method: "post",
          body: {
            auth: $authDirect(),
            perk: newPerk.value,
            location: generalStore.GET_LOCATION,
            hasCustomAmount: hasCustomAmount.value,
          },
        }).then(async (res) => {
          const returnBody = JSON.parse(res.body);
          isLoading.value = false;
          if (returnBody.snackbar) {
            snackbar.add(returnBody.snackbar);
            if (returnBody.snackbar.type == "success") {
              await getAllPerks();
              error.value.errorMessage = "";
              error.value.errorName = "";
              newPerk.value = "";
              hasCustomAmount.value = false;
            }
          }
        });
      } else {
        error.value.errorName = "perkError";
        error.value.errorMessage = "Je hebt geen waarde ingevuld.";
      }
    };

    const toggleDeleteConfirm = (perk) => {
      deleteID.value = perk.id;
      dialogOptions.value.title = "Onderdeel verwijderen";
      dialogOptions.value.description = `Weet je zeker dat je "${perk.name}" wilt verwijderen uit de lijst met benodigdheden? ${perk.name} zal hiermee ook uit alle bestaande reserveringen worden verwijderd.`;
      dialogOptions.value.cancelText = "Annuleren";
      dialogOptions.value.confirmText = "Verwijderen";
      dialogOptions.value.show = true;
    };

    const openEditModal = (perk) => {
      editedPerk.value = perk;
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      editedPerk.value = "";
      editedPerkNew.value = "";
      showEditModal.value = false;
    };

    const confirmDeletePerk = async () => {
      await $fetch("/api/deletePerk", {
        method: "post",
        body: {
          auth: $authDirect(),
          perk: deleteID.value,
        },
      }).then(async (res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
        getAllPerks();
        closeDialog();
      });
    };

    const editPerkName = async () => {
      await $fetch("/api/updatePerk", {
        method: "post",
        body: {
          auth: $authDirect(),
          currentPerk: editedPerk.value,
          newPerk: editedPerkNew.value,
        },
      }).then(async (res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
        getAllPerks();
        closeEditModal();
      });
    };

    const updatePerksOrder = async () => {
      await $fetch("/api/updatePerksOrder", {
        method: "post",
        body: {
          auth: $authDirect(),
          perks: perks.value,
        },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          perks.value = returnBody;
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
        if (n && hasAccessToComponent("calendar_roomSettings_showPerks")) {
          await getAllPerks();
        }
      }
    );

    onBeforeMount(async () => {
      if (
        generalStore.GET_LOCATION &&
        hasAccessToComponent("calendar_roomSettings_showPerks")
      ) {
        await getAllPerks();
      }
    });

    return {
      perks,
      hasAccessToComponent,
      newPerk,
      error,
      endDrag,
      addNewPerk,
      isLoading,
      toggleDeleteConfirm,
      dialogOptions,
      closeDialog,
      confirmDeletePerk,
      showEditModal,
      openEditModal,
      closeEditModal,
      editedPerk,
      editedPerkNew,
      editPerkName,
      hasCustomAmount,
    };
  },
};
</script>

<style scoped>
</style>