<template>
  <div class="">
    <div
      class="relative transition-all duration-500 ease-in-out right-0 pl-4 pr-4 md:pl-20 md:pr-20 pt-9 max-w-full left-0"
    >
      <div
        class="flex justify-between items-center bg-white dark:bg-black p-4 w-full rounded-xl shadow-mainBlack dark:shadow-mainWhite mb-4 sticky top-4 z-9880"
        v-if="user"
      >
        <div class="">&nbsp;</div>
        <div class="relative flex items-center gap-2">
          <!-- Locations btn -->
          <div class="relative">
            <span
              v-if="generalStore && generalStore.GET_LOCATION"
              class="absolute text-[10px] w-max transform -translate-x-5/7 -left-1/4 bg-palettes-theme-accent font-bold py-0.5 px-1 rounded-md -top-4/7"
              >{{ generalStore.GET_LOCATION.name }}</span
            >
            <Icon
              name="solar:buildings-broken"
              class="h-7 w-7 text-palettes-theme-gray dark:text-palettes-theme-white cursor-pointer"
              @click="showLocationsTab($event)"
            />
          </div>
          <div
            class="absolute w-max top-16 -translate-x-1/4 rounded bg-white dark:bg-black shadow-subtile dark:text-palettes-theme-white overflow-hidden"
            v-if="locations.length != 0 && locationsTabOpen"
          >
            <div
              class="flex items-center py-2 px-4 gap-2 transition-all"
              :class="
                generalStore.GET_LOCATION.name == location.name
                  ? ' font-semibold cursor-default'
                  : ' font-normal cursor-pointer hover:bg-palettes-theme-accent-hover'
              "
              v-for="location in locations"
              @click="
                generalStore.GET_LOCATION.name == location.name
                  ? ''
                  : setLocation(location)
              "
              :key="location.name"
            >
              {{ location.name }}
            </div>
          </div>
          <!-- settings btn -->
          <Icon
            name="solar:settings-broken"
            class="h-7 w-7 text-palettes-theme-gray dark:text-palettes-theme-white cursor-pointer"
            @click="showSettingsTab($event)"
          />

          <div
            class="w-10 h-10 rounded-full bg-palettes-theme-secondary border-palettes-theme-primary border-[3px] flex items-center justify-center uppercase font-bold text-palettes-theme-gray cursor-pointer"
            v-if="user"
            @click="toggleUserProperties"
          >
            {{ abbr }}
          </div>
          <div
            class="absolute w-max top-16 right-0 rounded bg-white dark:bg-black dark:text-standards-gray-light shadow-subtile overflow-hidden"
            v-if="showUserProperties"
          >
            <!-- user profile -->
            <Nuxt-Link
              to="/profiel"
              class="flex items-center py-2 px-4 gap-2 cursor-pointer hover:bg-palettes-theme-accent-hover transition-all"
            >
              <Icon
                name="solar:user-circle-broken"
                class="h-6 w-6 text-standards-gray-menu"
              />

              <span class="">Profiel</span>
            </Nuxt-Link>
            <!-- Logout -->
            <div
              class="flex items-center py-2 px-4 gap-2 text-red-400 cursor-pointer hover:bg-palettes-theme-accent-hover transition-all"
              @click="logOut"
            >
              <Icon name="solar:logout-broken" class="h-6 w-6" />

              <span class="">Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useUserStore } from "@/store/user";
import { useGeneralStore } from "@/store/general";

export default {
  props: {
    theme: Object,
  },

  setup(props, { emit }) {
    const { $authDirect } = useNuxtApp();
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();
    const generalStore = useGeneralStore();
    const snackbar = useSnackbar();

    const user = ref(null);
    const userData = ref(null);
    const authIsReady = ref(false);
    const showUserProperties = ref(false);
    const locationsTabOpen = ref(false);
    const abbr = ref("HI");
    const locations = ref([]);

    const showSettingsTab = (event) => {
      emit("showSettingsTab", event);
    };

    const showLocationsTab = () => {
      locationsTabOpen.value = !locationsTabOpen.value;
      showUserProperties.value = false;
    };

    const getLocations = async () => {
      await $fetch("/api/getLocationsForCurrentUser", {
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

    const getInitials = (fn, ln, mail) => {
      let plainLastname;
      if (ln && ln != "") {
        const allLastnames = ln.split(" ");
        const lastIndex = allLastnames.length - 1;
        plainLastname = allLastnames[lastIndex];
      }
      if (fn && fn != "" && plainLastname && plainLastname != "") {
        return fn.slice(0, 1) + plainLastname.slice(0, 1);
      } else if (fn && fn != "" && (!plainLastname || plainLastname == "")) {
        return fn.slice(0, 2);
      } else if (plainLastname && plainLastname != "" && (!fn || fn == "")) {
        return plainLastname.slice(0, 2);
      } else {
        return mail.slice(0, 2);
      }
    };

    onMounted(async () => {
      onAuthStateChanged($authDirect(), (newUser) => {
        user.value = newUser;
        authIsReady.value = true;

        abbr.value = getInitials(
          userStore.GET_USER_FIRSTNAME,
          userStore.GET_USER_LASTNAME,
          newUser.email
        );
      });

      getLocations().then(() => {
        // check if there is data in localStorage.
        if (
          localStorage.getItem("vilres__location") &&
          localStorage.getItem("vilres__location") != ""
        ) {
          // if there is, check if this value is in the location list, to check if the current user has access to this saved location
          const locationData = JSON.parse(
            localStorage.getItem("vilres__location")
          );
          let hasAccessToLocation = false;
          locations.value.map((location) => {
            if (location.name == locationData.name) {
              hasAccessToLocation = true;
            }
          });
          if (hasAccessToLocation) {
            generalStore.CHANGE_LOCATION(locationData);
          } else {
            if (locations.value.length == 0) {
              // if there aren't any locations the user has access to, log him out, as there is no reason for him to use the dashboard
              snackbar.add({
                type: "info",
                title: "Geen machtiging voor een locatie",
                text: `Je hebt geen locaties die je mag bekijken. Je wordt uitgelogd. Neem contact op met de systeembeheerder om toegang tot een locatie aan te vragen`,
              });
              logOut();
            } else {
              generalStore.CHANGE_LOCATION(locations.value[0]);
            }
          }
        } else {
          // if not, set the first location as active
          generalStore.CHANGE_LOCATION(locations.value[0]);
        }
      });
    });

    watch(
      () => route.name,
      () => {
        showUserProperties.value = false;
      }
    );

    const logOut = async () => {
      await signOut($authDirect());
      router.push("/");
    };

    const toggleUserProperties = () => {
      showUserProperties.value = !showUserProperties.value;
      locationsTabOpen.value = false;
    };

    const setLocation = (location) => {
      localStorage.setItem("vilres__location", JSON.stringify(location));
      generalStore.CHANGE_LOCATION(location);
      snackbar.add({
        type: "info",
        text: `Dashboard geswitched naar '${location.name}'`,
      });
      locationsTabOpen.value = false;
    };

    return {
      logOut,
      user,
      authIsReady,
      showUserProperties,
      abbr,
      toggleUserProperties,
      showSettingsTab,
      showLocationsTab,
      locations,
      locationsTabOpen,
      setLocation,
      generalStore,
    };
  },
};
</script>

<style scoped>
</style>