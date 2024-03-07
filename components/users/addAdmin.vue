<template>
  <div
    class="md:w-96 w-full h-screen p-4 bg-palettes-theme-white dark:bg-palettes-theme-black"
  >
    <div
      @click="$emit('closeOverlay')"
      class="absolute top-4 right-4 flex items-center justify-center cursor-pointer"
    >
      <Icon
        name="solar:close-square-broken"
        class="h-8 w-8 text-standards-gray-midnight dark:text-standards-gray-mid"
      />
    </div>
    <h2
      class="text-palettes-theme-gray dark:text-palettes-theme-white text-xl font-medium mb-6"
    >
      Gebruiker toevoegen
    </h2>
    <h6
      class="text-sm font-normal text-gray-h6 dark:text-palettes-theme-white mb-8"
    >
      Voeg een gebruiker toe die toegang krijgt tot dit dashboard
    </h6>
    <form @submit.prevent="addUser" class="">
      <div class="flex flex-col gap-4">
        <div class="relative flex items-center">
          <input
            type="email"
            v-model="email"
            autocomplete="email"
            placeholder="E-mail"
            id="email"
            class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
            :class="
              error.errorName != 'emailError'
                ? 'border-standards-gray-label text-standards-gray-label'
                : ' border-red-400 text-red-400'
            "
            required
          />
          <label
            for="email"
            class="absolute left-2 transition-all cursor-pointer"
            :class="
              error.errorName != 'emailError'
                ? ' text-standards-gray-label'
                : ' text-red-400'
            "
            >E-mail*</label
          >
        </div>
        <div class="relative flex items-center">
          <input
            type="firstname"
            v-model="firstname"
            placeholder="Voornaam"
            autocomplete="firstname"
            id="firstname"
            class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer text-standards-gray-label inputfield"
          />
          <label
            for="firstname"
            class="absolute left-2 transition-all cursor-pointer text-standards-gray-label"
            >Voornaam</label
          >
        </div>
        <div class="relative flex items-center">
          <input
            type="lastname"
            v-model="lastname"
            autocomplete="lastname"
            placeholder="Achternaam"
            id="lastname"
            class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer text-standards-gray-label inputfield"
          />
          <label
            for="lastname"
            class="absolute left-2 transition-all cursor-pointer text-standards-gray-label"
            >Achternaam</label
          >
        </div>
        <div class="relative flex items-center">
          <input
            type="text"
            name="role"
            id="role"
            class="w-full rounded-md py-2 px-1 focus:outline-0 transition-all cursor-pointer inputfield"
            :class="
              error.errorName != 'roleError'
                ? ' border-standards-gray-label text-standards-gray-label'
                : ' border-red-400 text-red-400'
            "
            v-model="selectedRoleDisplay"
            required
            placeholder="Accounttype"
            @mousedown="showRoleDropdown = true"
          />
          <label
            for="role"
            class="absolute left-2 transition-all cursor-pointer"
            :class="
              error.errorName != 'roleError'
                ? ' text-standards-gray-label'
                : ' text-red-400'
            "
            @mousedown="showRoleDropdown = true"
            >Accounttype*</label
          >
          <div
            class="w-full absolute left-0 top-12 bg-white rounded-md border-opacity-80 text-gray-light border border-gray-light py-2 z-30 overflow-y-auto customScroll max-h-32"
            v-if="showRoleDropdown"
          >
            <div
              class="cursor-pointer px-4 py-2 hover:bg-palettes-theme-accent-hover hover:bg-opacity-10 transition-all flex items-center justify-start"
              v-for="role in accounttypes"
              :key="role.name"
              @click="setRole(role)"
            >
              <span>
                {{ role.display }}
              </span>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="right-4 absolute h-6 text-gray-light cursor-pointer"
            @click="(selectedRole = null), (selectedRoleDisplay = null)"
            v-if="selectedRole != '' && selectedRoleDisplay != null"
            viewBox="0 0 24 24"
          >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
            />
          </svg>
        </div>

        <p
          v-if="error.errorName != null"
          :class="
            error.errorType == 'error' ? 'text-red-400' : ' text-green-mid'
          "
        >
          {{ error.errorMessage }}
        </p>
        <div class="relative flex items-center gap-4 select-none">
          <button
            type="confirm"
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
            @click="$emit('closeOverlay')"
            class="bg-standards-gray-label rounded-lg text-palettes-theme-gray uppercase font-medium text-sm px-5 h-9.5 flex items-center cursor-pointer"
          >
            Annuleren
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    accountTypes: Array,
  },

  setup(props, { emit }) {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();

    const email = ref("");
    const firstname = ref("");
    const lastname = ref("");
    const error = ref({ errorName: null, errorMessage: "", errorType: null });
    const isLoading = ref(false);
    const showRoleDropdown = ref(false);
    const selectedRole = ref(null);
    const selectedRoleDisplay = ref(null);
    const accounttypes = ref([]);

    watch(
      () => props.accountTypes,
      (n) => {
        accounttypes.value = n;
      }
    );

    const setRole = (role) => {
      showRoleDropdown.value = false;
      selectedRole.value = role;
      selectedRoleDisplay.value = role.display;
    };

    const addUser = async () => {
      error.value.errorName = null;
      error.value.errorMessage = "";
      error.value.errorType = null;
      if (isLoading.value) return;

      if (email.value == "") {
        error.value.errorName = "emailError";
        error.value.errorMessage = "Vul aub een email in";
        error.value.errorType = "error";
        return;
      }

      if (selectedRole.value == null) {
        error.value.errorName = "roleError";
        error.value.errorMessage = "Kies een accounttype";
        error.value.errorType = "error";
        return;
      }

      let obj = {
        email: email.value,
        theme: {
          mode: "light",
          color: "vilgaard",
          pattern: false,
          fixedTopbar: true,
          topbarColor: true,
        },
        accountType: selectedRole.value.id,
        firstname: firstname.value,
        lastname: lastname.value,
      };

      isLoading.value = true;

      await $fetch("/api/createDashboardUser", {
        method: "post",
        body: {
          auth: $authDirect(),
          input: obj,
        },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
          isLoading.value = false;

          if (returnBody.snackbar.type == "success") {
            emit("updateList");
            emit("closeOverlay");
          }
        }
      });
    };

    return {
      email,
      firstname,
      lastname,
      error,
      isLoading,
      showRoleDropdown,
      selectedRole,
      selectedRoleDisplay,
      accounttypes,
      setRole,
      addUser,
    };
  },
};
</script>

<style scoped>
</style>