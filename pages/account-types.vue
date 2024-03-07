<template>
  <section class="relative">
    <!-- confirm modal -->
    <generalConfirmDialog
      v-if="dialogOptions.show"
      @cancel="closeDialog"
      @confirm="deleteRole"
      :options="dialogOptions"
    />
    <!-- edit Modal -->
    <div
      v-if="showEditModal"
      class="w-full h-full fixed top-0 left-0 flex items-center justify-center z-9999"
    >
      <generalDarkOverlay @click="showEditModal = false" />
      <div
        class="bg-white dark:bg-black p-4 rounded-xl shadow-mainBlack dark:shadow-mainWhite md:max-w-lg max-w-xs sm:max-w-md overflow-x-hidden relative z-9882 flex flex-col gap-2 customScroll"
        style="height: calc(100vh - 40px)"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="">
            <h3
              class="font-medium text-2xl text-standards-gray-dark dark:text-white mb-2"
            >
              Bewerk rol
            </h3>
            <div class="flex items-center gap-2">
              <div
                class="text-xs uppercase font-normal rounded-full py-0.5 px-2 w-max"
                :style="`background-color:${modifiedAccountType.backgroundColor};color:${editedAccountType.textColor}`"
              >
                {{ modifiedAccountType.display }}
              </div>
              <div class="flex gap-1 items-center">
                <label for="color-picker">
                  <Icon
                    name="solar:pallete-2-bold-duotone"
                    class="h-6 w-6 text-palettes-theme-secondary cursor-pointer"
                  />
                </label>
                <input
                  type="color"
                  v-model="selectedColor"
                  id="color-picker"
                  class="invisible absolute"
                  required
                />
                <label for="text-color-picker">
                  <Icon
                    name="solar:text-circle-bold-duotone"
                    class="h-6 w-6 text-palettes-theme-secondary cursor-pointer"
                  />
                </label>
                <input
                  type="color"
                  v-model="selectedTextColor"
                  id="text-color-picker"
                  class="invisible absolute"
                  list="textcolors"
                  disable
                  required
                />
                <datalist id="textcolors">
                  <option value="#FFFFFF">Light</option>
                  <option value="#33303c">Dark</option>
                </datalist>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-start gap-2">
          <span
            class="uppercase text-xs font-medium text-standards-gray-dark dark:text-white"
            >Weergavenaam:</span
          >
          <span
            class="italic text-xs font-light text-gray-light text-standards-gray-label dark:text-white"
            >Dit is de naam zoals deze visueel getoond wordt in de app. Alleen
            letters (spaties toegestaan).</span
          >
          <input
            type="text"
            class="px-2 rounded-full inputfield"
            v-model="roleDisplay"
            pattern="[a-z]+"
            required
          />
        </div>
        <hr class="my-2" />
        <div class="flex flex-col items-start gap-2">
          <span
            class="uppercase text-xs font-medium text-standards-gray-dark dark:text-white"
            >Rechten:</span
          >
          <span
            class="italic text-xs font-light text-gray-light text-standards-gray-label dark:text-white"
            >Bepaal welke rechten dit account type krijgt.</span
          >
        </div>

        <div class="mt-4">
          <div class="mb-6" v-for="group in Object.keys(groupedAccountRights)">
            <h3
              class="uppercase text-xs font-medium text-standards-gray-dark dark:text-white"
            >
              {{ group }}
            </h3>
            <div
              class="flex items-center justify-between cursor-pointer gap-2"
              v-for="right in groupedAccountRights[group]"
              :key="right.name"
              @click="toggleAccess(right, checkAccessForSelectedRole(right))"
            >
              <div
                class="text-sm font-light text-standards-gray-label dark:text-white"
              >
                {{ roleDisplay + " " + right.thirdPersonDescriptive }}
              </div>

              <div class="relative flex items-center">
                <div
                  class="transition-all h-3.5 w-7 rounded-xl"
                  :class="
                    checkAccessForSelectedRole(right)[0]
                      ? ' bg-palettes-theme-secondary'
                      : 'bg-palettes-theme-gray'
                  "
                ></div>
                <div
                  class="transition-all h-4.5 w-4.5 rounded-full absolute"
                  :class="
                    checkAccessForSelectedRole(right)[0]
                      ? ' bg-palettes-theme-primary right-0'
                      : 'bg-palettes-theme-white right-3 shadow-mainBlack dark:shadow-mainWhite'
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="relative bottom-auto right-auto md:right-4 flex self-end gap-4 select-none"
        >
          <button
            class="rounded-full bg-palettes-theme-primary text-palettes-theme-white py-1 px-3 text-sm font-medium"
            :class="
              isLoading
                ? ' bg-opacity-60 cursor-not-allowed'
                : ' bg-opacity-100 cursor-pointer'
            "
            @click="saveChanges()"
          >
            <Icon
              name="solar:hourglass-broken"
              class="h-5 w-5 text-palettes-theme-white hourglass"
              v-if="isLoading"
            />
            <span v-else> Opslaan </span>
          </button>
          <button
            class="rounded-full bg-palettes-theme-accent-hover text-palettes-theme-gray py-1 px-3 text-sm font-medium"
            @click="showEditModal = false"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>

    <!-- add Modal -->
    <div
      v-if="showAddModal"
      class="w-full h-full fixed top-0 left-0 flex items-center justify-center z-9999"
    >
      <generalDarkOverlay @click="showAddModal = false" />
      <div
        class="bg-white dark:bg-black p-4 rounded-xl shadow-mainBlack dark:shadow-mainWhite md:max-w-lg max-w-xs sm:max-w-md overflow-x-hidden relative z-9882 flex flex-col gap-2 customScroll"
        style="height: calc(100vh - 40px)"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="">
            <h3
              class="font-medium text-2xl text-standards-gray-dark dark:text-white mb-2"
            >
              Rol aanmaken
            </h3>
            <div class="flex items-center gap-2">
              <div
                class="text-xs uppercase font-normal rounded-full py-0.5 px-2 w-max"
                :style="`background-color:${createdAccountType.backgroundColor};color:${createdAccountType.textColor}`"
              >
                {{ createdAccountType.display }}
              </div>
              <div class="flex gap-1 items-center">
                <label for="color-picker">
                  <Icon
                    name="solar:pallete-2-bold-duotone"
                    class="h-6 w-6 text-palettes-theme-secondary cursor-pointer"
                  />
                </label>
                <input
                  type="color"
                  v-model="createdAccountType.backgroundColor"
                  id="color-picker"
                  class="invisible absolute"
                  required
                />
                <label for="text-color-picker">
                  <Icon
                    name="solar:text-circle-bold-duotone"
                    class="h-6 w-6 text-palettes-theme-secondary cursor-pointer"
                  />
                </label>
                <input
                  type="color"
                  v-model="createdAccountType.textColor"
                  id="text-color-picker"
                  class="invisible absolute"
                  list="textcolors"
                  disable
                  required
                />
                <datalist id="textcolors">
                  <option value="#FFFFFF">Light</option>
                  <option value="#33303c">Dark</option>
                </datalist>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-start gap-2">
          <span
            class="uppercase text-xs font-medium text-standards-gray-dark dark:text-white"
            >Weergavenaam:</span
          >
          <span
            class="italic text-xs font-light text-gray-light text-standards-gray-label dark:text-white"
            >Dit is de naam zoals deze visueel getoond wordt in de app.</span
          >
          <input
            type="text"
            class="px-2 border-standards-gray-label border rounded-full"
            v-model="createdAccountType.display"
            pattern="[a-z]+"
            required
            placeholder="Naam"
          />
        </div>
        <hr class="my-2" />
        <div class="flex flex-col items-start gap-2">
          <span
            class="uppercase text-xs font-medium text-standards-gray-dark dark:text-white"
            >Rechten:</span
          >
          <span
            class="italic text-xs font-light text-standards-gray-label dark:text-white"
            >Bepaal welke rechten dit account type krijgt.</span
          >
        </div>

        <div class="mt-4">
          <div class="mb-6" v-for="group in Object.keys(groupedAccountRights)">
            <h3
              class="uppercase text-xs font-medium text-standards-gray-dark dark:text-white"
            >
              {{ group }}
            </h3>
            <div
              class="flex items-center justify-between cursor-pointer gap-2"
              v-for="right in groupedAccountRights[group]"
              :key="right.name"
              @click="
                toggleAccessNewRole(right, checkAccessForSelectedNewRole(right))
              "
            >
              <div
                class="text-sm font-light text-standards-gray-label dark:text-white"
              >
                {{
                  createdAccountType.display +
                  " " +
                  right.thirdPersonDescriptive
                }}
              </div>

              <div class="relative flex items-center">
                <div
                  class="transition-all h-3.5 w-7 rounded-xl"
                  :class="
                    checkAccessForSelectedNewRole(right)[0]
                      ? ' bg-palettes-theme-secondary'
                      : 'bg-palettes-theme-gray'
                  "
                ></div>
                <div
                  class="transition-all h-4.5 w-4.5 rounded-full absolute"
                  :class="
                    checkAccessForSelectedNewRole(right)[0]
                      ? ' bg-palettes-theme-primary right-0'
                      : 'bg-palettes-theme-white right-3 shadow-mainBlack dark:shadow-mainWhite'
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="relative bottom-auto right-auto md:right-4 flex self-end gap-4 select-none"
        >
          <button
            class="rounded-full bg-palettes-theme-primary text-palettes-theme-white py-1 px-3 text-sm font-medium"
            :class="
              isLoading
                ? ' bg-opacity-60 cursor-not-allowed'
                : ' bg-opacity-100 cursor-pointer'
            "
            @click="saveNewRole()"
          >
            <Icon
              name="solar:hourglass-broken"
              class="h-5 w-5 text-palettes-theme-white hourglass"
              v-if="isLoading"
            />
            <span v-else> Opslaan </span>
          </button>
          <button
            class="rounded-full bg-palettes-theme-accent-hover text-palettes-theme-gray py-1 px-3 text-sm font-medium"
            @click="showAddModal = false"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div
      class="bg-white dark:bg-black rounded-xl shadow-mainBlack dark:shadow-mainWhite p-4"
    >
      <h1
        class="font-semibold uppercase my-8 text-lg md:text-xl text-gray-title dark:text-white relative z-1000"
      >
        Accounttypes
      </h1>

      <div
        class="bg-white dark:bg-black w-full mb-4 gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="accountType in accountTypes"
          :key="accountType.name"
          class="flex flex-col justify-between items-start bg-white dark:bg-white dark:bg-opacity-10 p-4 w-full rounded-xl shadow-mainBlack dark:shadow-mainWhite h-36 relative order-2 md:order-1"
        >
          <div class="absolute top-4 right-4 flex justify-end flex-row-reverse">
            <div
              class="order-2"
              v-for="(avatar, index) in selectedAvatars(accountType.users)"
              :key="index"
              :style="`transform:translateX(${(index + 1) * 10}px); z-index: ${
                1000 + (index + 1)
              }`"
            >
              <div class="w-8 h-8 lg:w-12 lg:h-12 rounded-full">
                <img
                  v-if="avatar.avatar && avatar.avatar != ''"
                  class="rounded-full w-8 h-8 lg:h-12 lg:w-12 object-cover border-2 border-white dark:border-black"
                  :src="avatar.avatar"
                />
                <div
                  class="rounded-full h-8 w-8 lg:h-12 lg:w-12 object-cover border-2 border-white dark:border-black flex items-center justify-center bg-palettes-theme-secondary uppercase font-bold text-palettes-theme-gray text-sm lg:text-base"
                  v-else
                >
                  {{ getInitials(avatar) }}
                </div>
              </div>
            </div>
            <div
              class="order-1"
              v-if="accountType.users.length > 3"
              :style="`transform:translateX(${0 * 10}px); z-index: ${1000 + 0}`"
            >
              <div class="w-8 h-8 lg:w-12 lg:h-12 rounded-full">
                <div
                  class="rounded-full h-8 w-8 lg:h-12 lg:w-12 object-cover border-2 border-white dark:border-black flex items-center justify-center bg-standards-gray-label uppercase font-bold text-palettes-theme-gray text-sm lg:text-base"
                >
                  {{ "+" + (accountType.users.length - 3) }}
                </div>
              </div>
            </div>
          </div>
          <span
            class="text-sm font-normal text-gray-span dark:text-palettes-theme-white"
            >{{
              `Totaal ${accountType.users.length} gebruiker${
                accountType.users.length == 1 ? "" : "s"
              }`
            }}</span
          >
          <div class="w-full flex flex-col gap-2">
            <h2
              class="font-medium text-lg lg:text-2xl text-gray-title dark:text-white"
            >
              {{ accountType.display }}
            </h2>
            <div class="flex justify-between items-center w-full">
              <span
                class="text-xs uppercase font-normal rounded-full py-0.5 px-2"
                :style="`background-color:${accountType.backgroundColor};color:${accountType.textColor}`"
                >{{ accountType.name }}</span
              >
              <div class="flex items-center gap-2">
                <Icon
                  v-if="
                    hasAccessToComponent('userManagement_accountTypes_editRole')
                  "
                  name="solar:pen-broken"
                  class="h-6 w-6 text-gray-light dark:text-white cursor-pointer"
                  @click="editRole(accountType)"
                />
                <Icon
                  v-if="
                    hasAccessToComponent(
                      'userManagement_accountTypes_deleteRole'
                    )
                  "
                  name="solar:trash-bin-minimalistic-broken"
                  class="h-6 w-6 text-gray-light dark:text-white cursor-pointer"
                  @click="toggleDelete(accountType)"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- Add role -->
        <div
          v-if="hasAccessToComponent('userManagement_accountTypes_createRole')"
          class="flex flex-col justify-between items-start bg-white dark:bg-white dark:bg-opacity-10 p-0 sm:p-4 w-full rounded-xl shadow-none sm:shadow-mainBlack dark:shadow-mainWhite h-max sm:h-36 relative order-1 sm:order-2 -translate-y-16 sm:translate-y-0"
        >
          <div class="flex flex-col gap-4 items-end absolute right-4">
            <button
              class="bg-palettes-theme-secondary rounded-lg text-sm lg:text-base font-medium uppercase text-palettes-theme-white p-2"
              @click="showAddModal = true"
            >
              <span class="hidden md:block"> Toevoegen </span>
              <div class="block md:hidden">
                <Icon name="solar:add-circle-broken" class="h-6 w-6" />
              </div>
            </button>
            <span
              class="text-sm font-normal text-gray-span dark:text-white hidden sm:block"
              >Voeg een nieuw accounttype toe</span
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { watch } from "vue";
import { useUserStore } from "@/store/user";

export default {
  setup() {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();
    const userStore = useUserStore();

    const accountTypes = ref([]);
    const accountRights = ref([]);
    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);
    const showEditModal = ref(false);
    const showAddModal = ref(false);
    const editedAccountType = ref({});
    const createdAccountType = ref({
      name: "",
      backgroundColor: "#efefef",
      textColor: "#33303cde",
      display: "",
      accountRights: [],
    });
    const dialogOptions = ref({
      show: false,
      title: "",
      description: "",
      cancelText: "",
      confirmText: "",
    });
    const selectedColor = ref("#000000");
    const selectedTextColor = ref("#000000");
    const roleName = ref("");
    const roleDisplay = ref("");
    const isLoading = ref(false);
    const deleteRoleTemp = ref(null);

    const modifiedAccountType = computed(() => {
      return editedAccountType.value;
    });

    const groupedAccountRights = computed(() => {
      let obj = {};
      accountRights.value.map((right) => {
        if (right.menuItemId) {
          obj = {
            ...obj,
            [right.menuItem.i18n.nl.display]: [
              ...(obj[right.menuItem.i18n.nl.display] || []),
              right,
            ],
          };
        } else {
          obj = {
            ...obj,
            [right.submenuItem.i18n.nl.display]: [
              ...(obj[right.submenuItem.i18n.nl.display] || []),
              right,
            ],
          };
        }
      });

      return obj;
    });

    const closeDialog = () => {
      dialogOptions.value.title = "";
      dialogOptions.value.description = "";
      dialogOptions.value.cancelText = "";
      dialogOptions.value.confirmText = "";
      dialogOptions.value.show = false;
      deleteRoleTemp.value = null;
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

    const toggleDelete = (type) => {
      dialogOptions.value.title = "Accounttype verwijderen";
      dialogOptions.value.description = `Weet je zeker dat je het accounttype '${type.display}' wilt verwijderen?`;
      dialogOptions.value.cancelText = "Annuleren";
      dialogOptions.value.confirmText = "Verwijderen";
      dialogOptions.value.show = true;
      deleteRoleTemp.value = type;
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

    const getAllAccountRights = async () => {
      await $fetch("/api/getAccountRights", {
        method: "post",
        body: $authDirect(),
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          accountRights.value = returnBody;
        }
      });
    };

    const selectedAvatars = (users) => {
      if (users.length <= 3) {
        return users;
      } else {
        return users.slice(0, 3);
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

    const editRole = (role) => {
      showEditModal.value = true;
      selectedColor.value = role.backgroundColor;
      roleDisplay.value = role.display;
      roleName.value = role.name;
      editedAccountType.value = role;
    };

    const deleteRole = async () => {
      if (deleteRoleTemp.value.users.length != 0) {
        snackbar.add({
          type: "warning",
          text: "Je kunt pas een rol verwijderen als deze geen gebruikers meer heeft.",
        });
        closeDialog();
        return;
      }

      await $fetch("/api/deleteAccountType", {
        method: "post",
        body: {
          auth: $authDirect(),
          account: deleteRoleTemp.value,
        },
      }).then(async (res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
        closeDialog();
        await getAllAccountTypes();
        await getAllAccountRights();
      });
    };

    const checkAccessForSelectedRole = (right) => {
      let existsInSelectedRole =
        modifiedAccountType.value.accountRights.findIndex(
          (item) => item.id === right.id
        );

      if (existsInSelectedRole < 0) {
        const arr = [false, existsInSelectedRole];
        return arr;
      } else {
        const arr = [true, existsInSelectedRole];
        return arr;
      }
    };

    const checkAccessForSelectedNewRole = (right) => {
      let existsInSelectedRole =
        createdAccountType.value.accountRights.findIndex(
          (item) => item.id === right.id
        );

      if (existsInSelectedRole < 0) {
        const arr = [false, existsInSelectedRole];
        return arr;
      } else {
        const arr = [true, existsInSelectedRole];
        return arr;
      }
    };

    const toggleAccess = (right, exists) => {
      let alreadyExist = exists[0];
      let positionInArray = exists[1];

      let obj = {
        id: right.id,
        name: right.name,
        thirdPersonDescriptive: right.thirdPersonDescriptive,
      };
      if (alreadyExist) {
        modifiedAccountType.value.accountRights.splice(positionInArray, 1);
      } else {
        modifiedAccountType.value.accountRights.push(obj);
      }
    };

    const toggleAccessNewRole = (right, exists) => {
      let alreadyExist = exists[0];
      let positionInArray = exists[1];

      let obj = {
        id: right.id,
        name: right.name,
        thirdPersonDescriptive: right.thirdPersonDescriptive,
      };
      if (alreadyExist) {
        createdAccountType.value.accountRights.splice(positionInArray, 1);
      } else {
        createdAccountType.value.accountRights.push(obj);
      }
    };

    const saveChanges = async () => {
      isLoading.value = true;
      await $fetch("/api/updateAccountTypeRights", {
        method: "post",
        body: {
          auth: $authDirect(),
          submission: editedAccountType.value,
        },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        isLoading.value = false;
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);

          if (
            returnBody.snackbar.type == "success" &&
            editedAccountType.value.name == userStore.GET_ACCOUNT_TYPE
          ) {
            userStore.SET_ACCOUNT_RIGHTS(editedAccountType.value.accountRights);
          }
          showEditModal.value = false;
        }
      });
    };

    const saveNewRole = async () => {
      isLoading.value = true;
      await $fetch("/api/createAccountType", {
        method: "post",
        body: {
          auth: $authDirect(),
          submission: createdAccountType.value,
        },
      }).then(async (res) => {
        const returnBody = JSON.parse(res.body);
        isLoading.value = false;
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
          if (returnBody.snackbar.type == "success") {
            showAddModal.value = false;
            await getAllAccountTypes();
            await getAllAccountRights();
          }
        }
      });
    };

    watch(selectedColor, (value) => {
      editedAccountType.value.backgroundColor = value;
    });

    watch(selectedTextColor, (value) => {
      if (value == "#33303c") {
        editedAccountType.value.textColor = "#33303cde";
      } else {
        editedAccountType.value.textColor = value;
      }
    });

    watch(roleName, (name) => {
      editedAccountType.value.name = name;
    });

    watch(roleDisplay, (name) => {
      editedAccountType.value.display = name;
      editedAccountType.value.name = name.toLowerCase().replaceAll(" ", "-");
    });

    watch(createdAccountType.value, (name) => {
      createdAccountType.value.name = name.display
        .toLowerCase()
        .replaceAll(" ", "-");
    });

    onBeforeMount(async () => {
      await getAllAccountTypes();
      await getAllAccountRights();
    });

    return {
      accountTypes,
      accountRights,
      showEditModal,
      editedAccountType,
      selectedColor,
      selectedTextColor,
      roleDisplay,
      roleName,
      isLoading,
      selectedAvatars,
      getInitials,
      editRole,
      modifiedAccountType,
      checkAccessForSelectedRole,
      checkAccessForSelectedNewRole,
      toggleAccess,
      toggleAccessNewRole,
      saveChanges,
      showAddModal,
      createdAccountType,
      saveNewRole,
      userRights,
      hasAccessToComponent,
      deleteRole,
      groupedAccountRights,
      dialogOptions,
      closeDialog,
      toggleDelete,
    };
  },
};
</script>

<style  scoped>
</style>