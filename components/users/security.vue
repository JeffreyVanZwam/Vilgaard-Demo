<template>
  <div class="flex flex-col gap-4 relative">
    <generalConfirmDialog
      class="z-9881"
      v-if="dialogOptions.show"
      @cancel="closeDialog"
      @confirm="confirmPassChange"
      :options="dialogOptions"
    />

    <div
      class="fixed z-9881 top-0 left-0 w-screen h-screen flex items-center justify-center"
      v-if="showDeleteBox"
    >
      <generalDarkOverlay class="" @click="showDeleteBox = false" />
      <div
        class="bg-white shadow-mainBlack dark:shadow-mainWhite rounded p-4 relative z-9882 max-w-sm w-3/4"
      >
        <h1 class="text-palettes-theme-gray font-medium text-lg sm:text-xl">
          Bevestig verwijderen
        </h1>
        <p
          class="text-standards-gray-label font-normal text-sm sm:text-base leading-6 my-5"
        >
          Deze actie kan niet ongedaan gemaakt worden. Type onderstaande code en
          emailadres over om de actie te bevestigen.
        </p>
        <div class="flex flex-col gap-2 mb-4">
          <div class="relative">
            <span
              class="text-xs font-semibold"
              style="overflow-wrap: anywhere"
              >{{ user.id }}</span
            >
            <input
              type="text"
              v-model="deleteID"
              placeholder="Type de code over"
              class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield placeholder:text-palettes-theme-gray"
              :class="
                error.errorName != 'idCheckError'
                  ? 'border-standards-gray-label text-standards-gray-label'
                  : 'border border-red-400 text-red-400 bg-red-400'
              "
            />
          </div>
          <div class="relative">
            <span
              class="text-xs font-semibold"
              style="overflow-wrap: anywhere"
              >{{ user.email }}</span
            >
            <input
              type="email"
              v-model="deleteEmail"
              placeholder="Type het emailadres over"
              class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
              :class="
                error.errorName != 'emailCheckError'
                  ? 'border-standards-gray-label text-standards-gray-label'
                  : 'border border-red-400 text-red-400 bg-red-400'
              "
            />
          </div>
        </div>
        <p
          v-if="error.errorName != null"
          class="my-4 text-sm sm:text-md"
          :class="
            error.errorType == 'error' ? 'text-red-400' : 'text-green-400'
          "
        >
          {{ error.errorMessage }}
        </p>
        <div class="flex flex-col md:flex-row items-center gap-4 justify-end">
          <button
            @click="confirm()"
            class="bg-palettes-theme-primary rounded-lg text-white uppercase font-medium text-xs sm:text-sm px-3 sm:px-5 h-8 sm:h-9.5 transition-all"
            :class="
              (isLoading
                ? ' bg-opacity-60 cursor-not-allowed'
                : ' bg-opacity-100 cursor-pointer',
              mayShowConfirmButton
                ? 'opacity-100 cursor-pointer'
                : 'opacity-20 cursor-not-allowed')
            "
          >
            <Icon
              name="solar:hourglass-broken"
              class="h-6 w-6 text-white hourglass"
              v-if="isLoading"
            />

            <span v-else> Verwijderen</span>
          </button>
          <button
            @click="showDeleteBox = false"
            class="bg-standards-gray-label rounded-lg text-palettes-theme-gray uppercase font-medium text-xs sm:text-sm px-3 sm:px-5 h-8 sm:h-9.5 transition-all"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <section
      class="bg-white rounded-xl shadow-mainBlack dark:shadow-mainWhite overflow-hidden p-4"
    >
      <h1 class="text-xl font-medium text-palettes-theme-gray mb-4">
        Wachtwoord
      </h1>
      <form action="">
        <div class="relative flex items-center">
          <input
            type="password"
            v-model="newPassword"
            placeholder="Stel nieuw wachtwoord in"
            id="newPassword"
            class="w-full rounded-md py-2 px-1 focus:outline-0 outline-none transition-all cursor-pointer inputfield bg-gray-100"
            :class="
              error.errorName != 'newPassError'
                ? 'border-standards-gray-label text-standards-gray-label'
                : 'border border-red-400 text-red-400'
            "
            required
          />
          <label
            for="newPassword"
            class="absolute left-2 transition-all cursor-pointer"
            :class="
              error.errorName != 'newPassError'
                ? ' text-standards-gray-label'
                : ' text-red-400'
            "
            >Stel nieuw wachtwoord in</label
          >
        </div>
        <div
          @click="toggleNewPass"
          class="mt-4 bg-palettes-theme-primary w-max rounded-xl py-2 px-4 uppercase font-medium text-sm cursor-pointer"
        >
          Wijzigen
        </div>
      </form>
    </section>
    <section
      class="bg-white rounded-xl shadow-mainBlack dark:shadow-mainWhite overflow-hidden p-4 flex flex-col"
    >
      <h1 class="text-xl font-medium text-red-400">Danger zone</h1>
      <span class="font-bold uppercase text-xs mt-4 mb-2">
        Verwijder account
      </span>
      <span class="text-xs font-normal mb-2"
        >Hiermee wordt het account permanent uit het dashboard verwijderd. De
        gebruiker is niet langer in staat om in te loggen en alle gerelateerde
        gegevens aan deze gebruiker worden samen met het account verwijderd.
        Deze actie kan niet ongedaan gemaakt worden.</span
      >
      <button
        @click="prepareDelete"
        class="bg-red-400 w-max rounded-xl py-2 px-4 uppercase font-medium text-sm"
      >
        Verwijder account
      </button>
    </section>
  </div>
</template>

<script>
export default {
  props: {
    user: Object,
  },

  setup(props, { emit }) {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();
    const router = useRouter();

    const newPassword = ref("");
    const error = ref({ errorName: null, errorMessage: "", errorType: null });
    const showDeleteBox = ref(false);
    const isLoading = ref(false);
    const deleteEmail = ref("");
    const deleteID = ref("");
    const dialogOptions = ref({
      show: false,
      title: "",
      description: "",
      cancelText: "",
      confirmText: "",
    });

    const mayShowConfirmButton = computed(() => {
      if (
        deleteID.value != props.user.id ||
        deleteEmail.value != props.user.email
      ) {
        return false;
      } else {
        return true;
      }
    });

    const prepareDelete = () => {
      showDeleteBox.value = true;
    };

    const toggleNewPass = () => {
      error.value.errorName = "";
      error.value.errorMessage = "";
      error.value.errorType = "";

      if (newPassword.value == "") {
        error.value.errorName = "newPassError";
        error.value.errorMessage = "Geen wachtwoord ingevuld";
        error.value.errorType = "error";
        return;
      }

      dialogOptions.value.title = "Wachtwoord wijzigen";
      dialogOptions.value.description = `Weet je zeker dat je het wachtwoord voor gebruikersaccount '${props.user.email}' wilt wijzigen? Het oude wachtwoord komt hiermee te vervallen.`;
      dialogOptions.value.cancelText = "Annuleren";
      dialogOptions.value.confirmText = "Wijzigen";
      dialogOptions.value.show = true;
    };

    const closeDialog = () => {
      dialogOptions.value.title = "";
      dialogOptions.value.description = "";
      dialogOptions.value.cancelText = "";
      dialogOptions.value.confirmText = "";
      dialogOptions.value.show = false;
    };

    const confirmPassChange = async () => {
      await $fetch("/api/changeUserPassword", {
        method: "post",
        body: {
          auth: $authDirect(),
          user: props.user,
          input: newPassword.value,
        },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }

        closeDialog();
        newPassword.value = "";
      });
    };

    const confirm = async () => {
      error.value.errorName = null;
      error.value.errorMessage = "";
      error.value.errorType = null;

      if (deleteID.value != props.user.id) {
        error.value.errorName = "idCheckError";
        error.value.errorMessage = "De code komt niet overeen";
        error.value.errorType = "error";
        return;
      }

      if (deleteEmail.value != props.user.email) {
        error.value.errorName = "emailCheckError";
        error.value.errorMessage = "Het emailadres komt niet overeen";
        error.value.errorType = "error";
        return;
      }

      isLoading.value = true;
      await $fetch("/api/deleteDashboardUser", {
        method: "post",
        body: {
          auth: $authDirect(),
          user: props.user,
        },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
        isLoading.value = false;
        showDeleteBox.value = false;
        router.push("/gebruikers");
      });
    };

    return {
      newPassword,
      error,
      prepareDelete,
      showDeleteBox,
      isLoading,
      deleteEmail,
      deleteID,
      confirm,
      mayShowConfirmButton,
      toggleNewPass,
      dialogOptions,
      closeDialog,
      confirmPassChange,
    };
  },
};
</script>

<style scoped>
</style>