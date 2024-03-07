<template>
  <div
    class="w-screen xs:w-96 h-screen p-4 bg-white dark:bg-black overflow-y-auto settingsScroll"
  >
    <div
      @click="$emit('closeOverlay')"
      class="absolute top-4 right-4 w-8 h-8 rounded flex items-center justify-center cursor-pointer"
    >
      <Icon
        name="solar:close-square-broken"
        class="h-8 w-8 text-standards-gray-midnight dark:text-standards-gray-mid"
      />
    </div>
    <h2
      class="text-palettes-theme-gray dark:text-palettes-theme-white text-xl font-medium mb-6"
    >
      Instellingen
    </h2>
    <!-- General settings -->
    <div
      class="flex items-center justify-between gap-4 py-2 border-b cursor-pointer"
      @click="toggleTab('general')"
    >
      <div
        class="flex items-center gap-4 text-palettes-theme-gray dark:text-palettes-theme-white"
      >
        <icon name="solar:spedometer-low-bold-duotone" class="w-6 h-6" />
        <span class="font-semibold uppercase">Algemeen</span>
      </div>
      <icon
        name="solar:alt-arrow-down-broken"
        class="w-6 h-6 text-palettes-theme-gray dark:text-palettes-theme-white transform transition-all"
        :class="selectedTab == 'general' ? ' rotate-180' : 'rotate-0'"
      />
    </div>
    <div
      class="overflow-hidden transition-all"
      :class="selectedTab == 'general' ? 'max-h-[1000px]' : 'max-h-0'"
    >
      <div class="py-4">
        <h6
          class="text-xs uppercase font-bold text-standards-gray-midnight dark:text-white mb-4"
        >
          Startpagina
        </h6>
        <div
          class="px-1 py-2 rounded-md bg-gray-100 dark:bg-palettes-theme-black text-palettes-theme-gray dark:text-palettes-theme-white cursor-pointer capitalize mb-2"
          @click="showStartpageDD = !showStartpageDD"
        >
          {{ startpage }}
        </div>
        <div
          class="transition-all overflow-hidden"
          :class="showStartpageDD ? 'max-h-48' : 'max-h-0'"
        >
          <div class="">
            <div
              class="p-2 rounded-md shadow-mainBlack dark:shadow-mainWhite flex flex-col bg-gray-50 dark:bg-palettes-theme-black"
            >
              <div
                class="transition-all dark:text-palettes-theme-white"
                :class="
                  startpage == 'dashboard'
                    ? ' font-semibold cursor-default'
                    : ' font-normal cursor-pointer hover:text-palettes-theme-accent-hover dark:hover:text-palettes-theme-accent-hover '
                "
                @click="updateStartpage('dashboard')"
              >
                Dashboard
              </div>
              <div
                class="transition-all dark:text-palettes-theme-white"
                :class="
                  startpage == 'kalender'
                    ? ' font-bold cursor-default'
                    : ' font-normal cursor-pointer hover:text-palettes-theme-accent-hover dark:hover:text-palettes-theme-accent-hover '
                "
                @click="updateStartpage('kalender')"
              >
                Kalender
              </div>
            </div>
          </div>
        </div>
        <!-- Calendar view setting -->
        <h6
          class="mt-4 text-xs uppercase font-bold text-standards-gray-midnight dark:text-white mb-4"
        >
          Standaard kalenderweergave
        </h6>
        <div
          class="px-1 py-2 rounded-md bg-gray-100 dark:bg-palettes-theme-black text-palettes-theme-gray dark:text-palettes-theme-white cursor-pointer capitalize mb-2"
          @click="showCalendarbaseDD = !showCalendarbaseDD"
        >
          {{ calendarbase.display }}
        </div>
        <div
          class="transition-all overflow-hidden"
          :class="showCalendarbaseDD ? 'max-h-48' : 'max-h-0'"
        >
          <div class="">
            <div
              class="p-2 rounded-md shadow-mainBlack dark:shadow-mainWhite flex flex-col bg-gray-50 dark:bg-palettes-theme-black"
            >
              <div
                class="transition-all dark:text-palettes-theme-white"
                :key="view.name"
                :class="
                  calendarbase.name == view.name
                    ? 'font-bold cursor-default'
                    : 'font-normal cursor-pointer hover:text-palettes-theme-accent-hover dark:hover:text-palettes-theme-accent-hover'
                "
                @click="updateCalendarbase(view)"
                v-for="view in viewTypes"
              >
                {{ view.display }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Security settings -->
    <div
      class="flex items-center justify-between gap-4 py-2 border-b cursor-pointer"
      @click="toggleTab('security')"
    >
      <div
        class="flex items-center gap-4 text-palettes-theme-gray dark:text-palettes-theme-white"
      >
        <icon name="solar:lock-keyhole-bold-duotone" class="w-6 h-6" />
        <span class="font-semibold uppercase">Veiligheid</span>
      </div>
      <icon
        name="solar:alt-arrow-down-broken"
        class="w-6 h-6 text-palettes-theme-gray dark:text-palettes-theme-white transform transition-all"
        :class="selectedTab == 'security' ? ' rotate-180' : 'rotate-0'"
      />
    </div>
    <div
      class="overflow-hidden transition-all"
      :class="selectedTab == 'security' ? 'max-h-[1000px]' : 'max-h-0'"
    >
      <div class="py-4 flex flex-col gap-4">
        <h6
          class="text-xs uppercase font-bold text-standards-gray-midnight dark:text-white"
        >
          Geldigheidsduur inlogsessie
        </h6>
        <div class="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="720"
            v-model="idleInt"
            id="idleInt"
            class="rounded-md py-2 px-1 border focus:outline-0 transition-all cursor-pointer inputfield border-gray-100 text-standards-gray-label w-1/4"
          />

          <span class="dark:text-palettes-theme-white font-normal">
            {{ `${idleInt == 1 ? "minuut" : "minuten"}` }}
          </span>
        </div>
        <div
          class="bg-palettes-theme-primary rounded-lg text-white uppercase transform transition-all font-medium text-sm px-5 h-9.5 cursor-pointer w-max flex items-center justify-center self-end"
          v-if="showIdleSave"
          @click="updateIdleDuration"
        >
          Opslaan
        </div>
      </div>
    </div>
    <!-- theme settings -->
    <div
      class="flex items-center justify-between gap-4 py-2 border-b cursor-pointer"
      @click="toggleTab('theme')"
    >
      <div
        class="flex items-center gap-4 text-palettes-theme-gray dark:text-palettes-theme-white"
      >
        <icon name="solar:palette-bold-duotone" class="w-6 h-6" />
        <span class="font-semibold uppercase">Thema</span>
      </div>
      <icon
        name="solar:alt-arrow-down-broken"
        class="w-6 h-6 text-palettes-theme-gray dark:text-palettes-theme-white transform transition-all"
        :class="selectedTab == 'theme' ? ' rotate-180' : 'rotate-0'"
      />
    </div>
    <div
      class="overflow-hidden transition-all"
      :class="selectedTab == 'theme' ? 'max-h-[1000px]' : 'max-h-0'"
    >
      <div class="py-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="">
            <h6
              class="text-xs uppercase font-bold text-standards-gray-midnight dark:text-white mb-4"
            >
              Darkmode
            </h6>
            <div
              class="relative flex items-center w-max"
              @click="toggleThemeMode"
            >
              <div
                class="transition-all h-3.5 w-7 rounded-xl"
                :class="
                  selectedThemeMode == 'dark'
                    ? ' bg-palettes-theme-secondary'
                    : 'bg-palettes-theme-gray dark:bg-white dark:bg-opacity-10'
                "
              ></div>
              <div
                class="transition-all h-4.5 w-4.5 rounded-full absolute"
                :class="
                  selectedThemeMode == 'dark'
                    ? ' bg-palettes-theme-primary right-0'
                    : 'bg-palettes-theme-white dark:bg-palettes-theme-black right-3 shadow-mainBlack dark:shadow-mainWhite'
                "
              ></div>
            </div>
          </div>

          <div class="">
            <h6
              class="text-xs uppercase font-bold text-standards-gray-midnight dark:text-white mb-4"
            >
              Topbar vast
            </h6>
            <div
              class="relative flex items-center w-max"
              @click="toggleThemeFixedTopbar"
            >
              <div
                class="transition-all h-3.5 w-7 rounded-xl"
                :class="
                  selectedThemeFixedTopbar
                    ? ' bg-palettes-theme-secondary'
                    : 'bg-palettes-theme-gray dark:bg-white dark:bg-opacity-10'
                "
              ></div>
              <div
                class="transition-all h-4.5 w-4.5 rounded-full absolute"
                :class="
                  selectedThemeFixedTopbar
                    ? ' bg-palettes-theme-primary right-0'
                    : 'bg-palettes-theme-white dark:bg-palettes-theme-black right-3 shadow-mainBlack dark:shadow-mainWhite'
                "
              ></div>
            </div>
          </div>

          <div class="">
            <h6
              class="text-xs uppercase font-bold text-standards-gray-midnight dark:text-white mb-4"
            >
              Canvas kleur
            </h6>
            <div
              class="relative flex items-center w-max"
              @click="toggleThemeTopbarColor"
            >
              <div
                class="transition-all h-3.5 w-7 rounded-xl"
                :class="
                  selectedThemeTopbarColor
                    ? ' bg-palettes-theme-secondary'
                    : 'bg-palettes-theme-gray dark:bg-white dark:bg-opacity-10'
                "
              ></div>
              <div
                class="transition-all h-4.5 w-4.5 rounded-full absolute"
                :class="
                  selectedThemeTopbarColor
                    ? ' bg-palettes-theme-primary right-0'
                    : 'bg-palettes-theme-white dark:bg-palettes-theme-black right-3 shadow-mainBlack dark:shadow-mainWhite'
                "
              ></div>
            </div>
          </div>

          <div class="" v-if="selectedThemeTopbarColor">
            <h6
              class="text-xs uppercase font-bold text-standards-gray-midnight dark:text-white mb-4"
            >
              Canvas patroon
            </h6>
            <div
              class="relative flex items-center w-max"
              @click="toggleThemePattern"
            >
              <div
                class="transition-all h-3.5 w-7 rounded-xl"
                :class="
                  selectedThemePattern
                    ? ' bg-palettes-theme-secondary'
                    : 'bg-palettes-theme-gray dark:bg-white dark:bg-opacity-10'
                "
              ></div>
              <div
                class="transition-all h-4.5 w-4.5 rounded-full absolute"
                :class="
                  selectedThemePattern
                    ? ' bg-palettes-theme-primary right-0'
                    : 'bg-palettes-theme-white dark:bg-palettes-theme-black right-3 shadow-mainBlack dark:shadow-mainWhite'
                "
              ></div>
            </div>
          </div>
        </div>

        <h6
          class="text-xs uppercase font-bold text-standards-gray-midnight dark:text-white my-4"
        >
          Themakleur
        </h6>

        <div
          class="flex items-center w-max mb-2 gap-2 cursor-pointer"
          v-for="color in Object.keys(themeColors)"
          :key="color"
          @click="switchThemeColor(color)"
        >
          <div
            class="flex items-center gap-1 p-2 rounded-lg bg-standards-gray-midnight dark:bg-standards-gray-light"
            :class="
              color == selectedThemeColor
                ? ' bg-opacity-30 dark:bg-opacity-30'
                : ' bg-opacity-5 dark:bg-opacity-10'
            "
          >
            <div
              class="h-5 w-5 rounded-full border-standards-gray-label"
              :style="`background-color:${themeColors[color].primary}`"
            ></div>
            <div
              class="h-5 w-5 rounded-full border-standards-gray-label"
              :style="`background-color:${themeColors[color].secondary}`"
            ></div>
            <div
              class="h-5 w-5 rounded-full border-standards-gray-label"
              :style="`background-color:${themeColors[color].accent}`"
            ></div>
            <div
              class="h-5 w-5 rounded-full border-standards-gray-label"
              :style="`background-color:${themeColors[color].gray}`"
            ></div>
            <div
              class="h-5 w-5 rounded-full border-standards-gray-label"
              :style="`background-color:${themeColors[color].white}`"
            ></div>
          </div>
          <span
            class="text-xs uppercase text-standards-gray-midnight dark:text-white"
            :class="
              color == selectedThemeColor ? ' font-semibold' : ' font-medium'
            "
            >{{ color }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "@/store/user";

export default {
  props: {
    theme: Object,
    startpage: String,
    calendarbase: Object,
    idleDuration: Number,
  },

  setup(props, { emit }) {
    const themeColors = {
      green: {
        primary: "#28c76f",
        secondary: "#95e06c",
        gray: "#333453",
        accent: "#f7fff6",
        accentHover: "#ededed",
        white: "#faf9fa",
      },
      blue: {
        primary: "#008ada",
        secondary: "#00aeda",
        gray: "#44455f",
        accent: "#eefaff",
        accentHover: "#ededed",
        white: "#faf9fa",
      },
      turqoise: {
        primary: "#58bda2",
        secondary: "#69c7be",
        gray: "#44455f",
        accent: "#c7e8e5",
        accentHover: "#ededed",
        white: "#faf9fa",
      },
      moss: {
        primary: "#c8e087",
        secondary: "#ddfcad",
        gray: "#44455f",
        accent: "#c7e8e5",
        accentHover: "#ededed",
        white: "#faf9fa",
      },
      lime: {
        primary: "#b5c23b",
        secondary: "#d1df4a",
        gray: "#44455f",
        accent: "#f3f7cf",
        accentHover: "#ededed",
        white: "#faf9fa",
      },
      yellow: {
        primary: "#ffb007",
        secondary: "#ffd820",
        gray: "#44455f",
        accent: "#fff0c5",
        accentHover: "#ededed",
        white: "#faf9fa",
      },
      orange: {
        primary: "#ff5722",
        secondary: "#ff6b11",
        gray: "#44455f",
        accent: "#ffdbd0",
        accentHover: "#ededed",
        white: "#faf9fa",
      },
      red: {
        primary: "#f44336",
        secondary: "#f55151",
        gray: "#44455f",
        accent: "#fdb5b0",
        accentHover: "#ededed",
        white: "#faf9fa",
      },
      fuchsia: {
        primary: "#e91e63",
        secondary: "#f74d87",
        gray: "#44455f",
        accent: "#fbbcd1",
        accentHover: "#ededed",
        white: "#faf9fa",
      },
      purple: {
        primary: "#7e288d",
        secondary: "#d356e8",
        gray: "#44455f",
        accent: "#f6c0ff",
        accentHover: "#ededed",
        white: "#faf9fa",
      },
      lavender: {
        primary: "#5e548e",
        secondary: "#9f86c0",
        gray: "#44455f",
        accent: "#e0b1cb",
        accentHover: "#be95c4",
        white: "#faf9fa",
      },
      ocean: {
        primary: "#70abaf",
        secondary: "#99e1d9",
        gray: "#44455f",
        accent: "#f0f7f4",
        accentHover: "#be95c4",
        white: "#faf9fa",
      },
      lollipop: {
        primary: "#f56476",
        secondary: "#008dd5",
        gray: "#44455f",
        accent: "#dfbbb1",
        accentHover: "#be95c4",
        white: "#faf9fa",
      },
      classic: {
        primary: "#5c6d70",
        secondary: "#a37774",
        gray: "#484a47",
        accent: "#e0ac9d",
        accentHover: "#e88873",
        white: "#faf9fa",
      },
      business: {
        primary: "#284b63",
        secondary: "#b4b8ab",
        gray: "#153243",
        accent: "#f4f9e9",
        accentHover: "#eef0eb",
        white: "#faf9fa",
      },
      jungle: {
        primary: "#008148",
        secondary: "#c6c013",
        gray: "#034732",
        accent: "#fbcac6",
        accentHover: "#ef8a17",
        white: "#faf9fa",
      },
      sunset: {
        primary: "#8e24aa",
        secondary: "#ff6e40",
        gray: "#034732",
        accent: "#fbcac6",
        accentHover: "#ef8a17",
        white: "#faf9fa",
      },
      vilgaard: {
        primary: "#28D16C",
        secondary: "#06BC67",
        gray: "#022d20",
        accent: "#F9EB19",
        accentHover: "#E1D417",
        white: "#faf9fa",
      },
    };
    const viewTypes = [
      {
        name: "daylist",
        display: "Dagweergave",
        icon: "solar:list-bold-duotone",
      },
      {
        name: "printview",
        display: "Weekweergave",
        icon: "solar:printer-2-bold-duotone",
      },
      {
        name: "monthlist",
        display: "Maandweergave",
        icon: "solar:calendar-bold-duotone",
      },
      {
        name: "locationlist",
        display: "Locatieweergave",
        icon: "solar:posts-carousel-horizontal-bold-duotone",
      },
    ];
    const selectedTab = ref("");
    const showStartpageDD = ref(false);
    const showCalendarbaseDD = ref(false);
    const showIdleSave = ref(false);
    const userStore = useUserStore();
    const selectedThemeColor = ref("");
    const selectedThemeMode = ref(props.theme.mode);
    const selectedThemeTopbarColor = ref(props.theme.topbarColor);
    const selectedThemePattern = ref(props.theme.pattern);
    const selectedThemeFixedTopbar = ref(props.theme.fixedTopbar);
    const idleInt = ref(0);
    const snackbar = useSnackbar();
    const { $authDirect } = useNuxtApp();
    const editedTheme = computed(() => {
      return {
        mode: selectedThemeMode.value,
        color: selectedThemeColor.value,
        pattern: selectedThemePattern.value,
        fixedTopbar: selectedThemeFixedTopbar.value,
        topbarColor: selectedThemeTopbarColor.value,
      };
    });

    onBeforeMount(() => {
      // TODO: first check if this is not already set in the user object, otherwise it might overwrite that value
      if (localStorage.getItem("vilgaard__theme")) {
        const localStorageValue = JSON.parse(
          localStorage.getItem("vilgaard__theme")
        );
        selectedThemeColor.value = localStorageValue.color;
        selectedThemeMode.value = localStorageValue.mode;
        selectedThemeTopbarColor.value = localStorageValue.topbarColor;
        selectedThemePattern.value = localStorageValue.pattern;
        selectedThemeFixedTopbar.value = localStorageValue.fixedTopbar;
      }
      idleInt.value = props.idleDuration / 1000 / 60;
    });

    const toggleThemeMode = async () => {
      if (selectedThemeMode.value == "light") {
        selectedThemeMode.value = "dark";
      } else {
        selectedThemeMode.value = "light";
      }
      updateTheme();
      emit("switchThemeMode", selectedThemeMode.value);
    };

    const updateStartpage = async (page) => {
      await $fetch("/api/updateStartpage", {
        method: "post",
        body: { auth: $authDirect(), page: page },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        showStartpageDD.value = false;
        userStore.SET_STARTPAGE(page);
        emit("changeStartpage", page);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
      });
    };

    const updateIdleDuration = async () => {
      const ms = idleInt.value * 60 * 1000;
      await $fetch("/api/updateIdleDuration", {
        method: "post",
        body: { auth: $authDirect(), ms: ms },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        userStore.SET_IDLEDURATION(ms);
        emit("changeIdleDuration", ms);
        showIdleSave.value = false;
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
      });
    };

    const updateCalendarbase = async (view) => {
      await $fetch("/api/updateCalendarbase", {
        method: "post",
        body: { auth: $authDirect(), view: view },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        showCalendarbaseDD.value = false;
        userStore.SET_CALENDARBASE(view);
        emit("changeCalendarbase", view);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
      });
    };

    const toggleTab = (tab) => {
      if (selectedTab.value == tab) {
        selectedTab.value = "";
      } else {
        selectedTab.value = tab;
      }
    };

    const updateTheme = async () => {
      localStorage.setItem(
        "vilgaard__theme",
        JSON.stringify(editedTheme.value)
      );

      await $fetch("/api/updateTheme", {
        method: "post",
        body: { auth: $authDirect(), theme: editedTheme.value },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
      });
    };

    const toggleThemeTopbarColor = async () => {
      selectedThemeTopbarColor.value = !selectedThemeTopbarColor.value;
      if (!selectedThemeTopbarColor.value) {
        selectedThemePattern.value = false;
        emit("switchThemePattern", selectedThemePattern.value);
      }
      updateTheme();
      emit("switchThemeTopbarColor", selectedThemeTopbarColor.value);
    };

    const toggleThemeFixedTopbar = async () => {
      selectedThemeFixedTopbar.value = !selectedThemeFixedTopbar.value;
      updateTheme();
      emit("switchThemeFixedTopbar", selectedThemeFixedTopbar.value);
    };

    const toggleThemePattern = async () => {
      selectedThemePattern.value = !selectedThemePattern.value;
      updateTheme();
      emit("switchThemePattern", selectedThemePattern.value);
    };

    const switchThemeColor = async (theme) => {
      selectedThemeColor.value = theme;
      updateTheme();

      emit("switchThemeColor", theme);
    };

    watch(idleInt, () => {
      if (idleInt.value != props.idleDuration / 1000 / 60) {
        showIdleSave.value = true;
      } else {
        showIdleSave.value = false;
      }
    });

    return {
      themeColors,
      viewTypes,
      switchThemeColor,
      selectedThemeColor,
      selectedThemeMode,
      selectedThemeTopbarColor,
      selectedThemeFixedTopbar,
      selectedThemePattern,
      toggleThemeMode,
      toggleThemeTopbarColor,
      toggleThemeFixedTopbar,
      toggleThemePattern,
      toggleTab,
      selectedTab,
      showStartpageDD,
      showCalendarbaseDD,
      updateStartpage,
      updateCalendarbase,
      updateIdleDuration,
      idleInt,
      showIdleSave,
    };
  },
};
</script>

<style scoped>
.settingsScroll::-webkit-scrollbar {
  inline-size: 14px;
}

.settingsScroll::-webkit-scrollbar-track {
  background: #fff;
}
.dark .settingsScroll::-webkit-scrollbar-track {
  background: #000;
}

.settingsScroll::-webkit-scrollbar-thumb {
  background: var(--gray);
  border-radius: 12px;
  border: solid 5px #fff;
  transition: all 500ms ease-in-out;
}
.dark .settingsScroll::-webkit-scrollbar-thumb {
  background: var(--white);
  border-radius: 12px;
  border: solid 5px #000;
  transition: all 500ms ease-in-out;
}

.settingsScroll::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}
</style>