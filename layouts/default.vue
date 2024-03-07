<template>
  <div :class="theme.mode">
    <div
      class="font-PublicSans w-full overflow-x-hidden min-h-screen bg-standards-gray-light dark:bg-palettes-theme-black print:bg-white"
      :class="theme.color"
    >
      <template v-if="authIsReady">
        <img
          v-if="theme.pattern"
          src="@/assets/brush.jpg"
          class="fixed top-0 left-0 w-full h-48 object-cover print:hidden"
        />

        <div
          class="fixed top-0 left-0 w-full h-48 print:hidden"
          :class="
            theme.topbarColor
              ? 'bg-gradient-to-br from-palettes-theme-secondary to-palettes-theme-primary opacity-80'
              : ''
          "
        ></div>

        <generalNavbar @toggleMenu="toggleMenu" class="print:hidden" />

        <generalTopbar
          @showSettingsTab="showSettingsBar()"
          :theme="theme"
          class="transition-all duration-500 ease-in-out right-0 w-full block z-9860 print:hidden"
          :class="[
            menuOpen ? 'left-80 overflow-hidden' : 'left-0',
            theme.fixedTopbar ? 'fixed' : 'relative',
          ]"
        />

        <generalSettings
          @switchThemeColor="switchThemeColor($event)"
          @switchThemeTopbarColor="switchThemeTopbarColor($event)"
          @switchThemeFixedTopbar="switchThemeFixedTopbar($event)"
          @switchThemePattern="switchThemePattern($event)"
          @switchThemeMode="switchThemeMode($event)"
          @closeOverlay="closeSettingsBar()"
          @changeStartpage="toggleStartpage($event)"
          @changeCalendarbase="toggleCalendarbase($event)"
          @changeIdleDuration="changeIdleDuration($event)"
          class="transform transition-all z-9999 top-0 shadow-mainBlack dark:shadow-mainWhite fixed"
          :class="showSettings ? 'right-0' : '-right-full'"
          :theme="theme"
          :startpage="startpage"
          :calendarbase="calendarbase"
          :idleDuration="idleTimeout"
        />

        <div
          class="z-9860 w-full top-0 glass"
          :class="theme.fixedTopbar ? 'fixed h-9' : 'relative h-0'"
        ></div>

        <generalIdle
          class="fixed z-9999 w-screen h-screen glass"
          v-if="showIdleWarning"
          @closeIdle="closeIdle"
        />

        <div
          class="relative transition-all duration-500 ease-in-out right-0 pl-4 pr-4 md:pl-20 md:pr-20 max-w-full"
          :class="[
            menuOpen ? 'left-80' : 'left-0',
            theme.fixedTopbar ? 'pt-32' : 'pt-0',
          ]"
        >
          <slot />
        </div>
      </template>

      <VitePwaManifest />
      <NuxtSnackbar />
    </div>
  </div>
</template>

<script>
import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "@/store/user";
import { useGeneralStore } from "@/store/general";

export default {
  setup() {
    const { $authDirect } = useNuxtApp();
    const userStore = useUserStore();
    const generalStore = useGeneralStore();

    const user = ref(null);
    const authIsReady = ref(false);
    const menuOpen = ref(false);
    const showSettings = ref(false);
    const theme = ref({
      mode: "light",
      color: "vilgaard",
      pattern: false,
      fixedTopbar: true,
      topbarColor: true,
    });
    const startpage = ref("dashboard");
    const calendarbase = ref({
      name: "daylist",
      display: "Dagweergave",
      icon: "solar:list-bold-duotone",
    });
    let idleTimer = null;
    const idleTimeout = ref(5000); // default value is overwritten by user's settings
    const showIdleWarning = ref(false);

    const resetIdleTimer = () => {
      // Clear the previous idle timer
      clearTimeout(idleTimer);

      // Set a new idle timer
      idleTimer = setTimeout(() => {
        // This function will be called when the user is idle
        showIdleWarning.value = true;

        // Reset the timer for the next idle period
        resetIdleTimer();
      }, idleTimeout.value);
    };

    const closeIdle = () => {
      showIdleWarning.value = false;
    };

    const showSettingsBar = () => {
      showSettings.value = true;
    };

    const closeSettingsBar = () => {
      showSettings.value = false;
    };

    const toggleMenu = ({ val }) => {
      menuOpen.value = val;
    };

    const switchThemeColor = (e) => {
      theme.value.color = e;
    };

    const switchThemeTopbarColor = (e) => {
      theme.value.topbarColor = e;
    };

    const switchThemeFixedTopbar = (e) => {
      theme.value.fixedTopbar = e;
    };

    const switchThemePattern = (e) => {
      theme.value.pattern = e;
    };

    const switchThemeMode = (e) => {
      theme.value.mode = e;
    };

    const toggleStartpage = (e) => {
      startpage.value = e;
    };

    const changeIdleDuration = (e) => {
      idleTimeout.value = e;
    };

    const toggleCalendarbase = (e) => {
      calendarbase.value = e;
    };

    watch(showSettings, () => {
      if (showSettings.value == true) {
        generalStore.HIDE_MENU_BTN();
      }
      if (showSettings.value == false) {
        generalStore.SHOW_MENU_BTN();
      }
    });

    watch(idleTimeout, () => {
      resetIdleTimer();
    });

    onMounted(() => {
      onAuthStateChanged($authDirect(), async (newUser) => {
        if (newUser) {
          await $fetch("/api/getThemeAndAccountRights", {
            method: "post",
            body: $authDirect(),
          }).then((res) => {
            const returnBody = JSON.parse(res.body);
            theme.value = returnBody.theme;
            startpage.value = returnBody.startpage;
            calendarbase.value = returnBody.calendarBaseview;
            userStore.SET_ACCOUNT_TYPE(returnBody.accountType.name);
            userStore.SET_ACCOUNT_RIGHTS(returnBody.accountType.accountRights);
            userStore.SET_USER_FIRSTNAME(returnBody.firstname);
            userStore.SET_USER_LASTNAME(returnBody.lastname);
            userStore.SET_STARTPAGE(returnBody.startpage);
            userStore.SET_CALENDARBASE(returnBody.calendarBaseview);
            userStore.SET_IDLEDURATION(returnBody.idleDuration);
          });

          // await $fetch("/api/ical", {
          //   method: "get",
          // });
        }
        user.value = newUser;
        authIsReady.value = true;
        idleTimeout.value = userStore.GET_IDLEDURATION;
      });

      // Add event listeners to detect user activity
      document.addEventListener("mousemove", resetIdleTimer);
      document.addEventListener("keypress", resetIdleTimer);
    });

    onBeforeUnmount(() => {
      // Clean up by removing event listeners and clearing the timer
      // document.removeEventListener("mousemove", resetIdleTimer);
      // document.removeEventListener("keypress", resetIdleTimer);
      clearTimeout(idleTimer.value);
    });

    return {
      menuOpen,
      theme,
      toggleMenu,
      user,
      authIsReady,
      switchThemeColor,
      switchThemeTopbarColor,
      switchThemeFixedTopbar,
      switchThemePattern,
      closeSettingsBar,
      showSettingsBar,
      showSettings,
      startpage,
      calendarbase,
      toggleStartpage,
      toggleCalendarbase,
      switchThemeMode,
      showIdleWarning,
      closeIdle,
      idleTimeout,
      changeIdleDuration,
    };
  },
};
</script>

<style>
.glass {
  /* background: rgba(255, 255, 255, 0.2); */
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
</style>