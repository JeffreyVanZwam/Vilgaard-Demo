<template>
  <div class="flex flex-col gap-4">
    <h1
      class="font-semibold uppercase my-4 text-lg md:text-xl text-gray-title relative z-1000"
    >
      Instellingen
    </h1>
    <div class="flex items-center gap-4 justify-start">
      <generalTabsLocations
        :selectedTab="selectedTab"
        @changeTab="toggleTab($event)"
        tabName="locations"
        tabDisplay="Locatiebeheer"
        class="w-full xs:w-1/2 sm:w-1/3 xl:w-1/7 2xl:w-1/7"
        v-if="hasAccessToComponent('generalSettings_locations_showLocations')"
      />
      <generalTabsCalendarsettings
        :selectedTab="selectedTab"
        @changeTab="toggleTab($event)"
        tabName="rooms"
        tabDisplay="Zaalbeheer"
        class="w-full xs:w-1/2 sm:w-1/3 xl:w-1/7 2xl:w-1/7"
        v-if="
          hasAccessToComponent('calendar_roomSettings_showRooms') ||
          hasAccessToComponent('calendar_roomSettings_showPerks')
        "
      />
      <!-- <generalTabsServicetickets
        :selectedTab="selectedTab"
        @changeTab="toggleTab($event)"
        tabName="servicetickets"
        tabDisplay="Servicetickets"
        class="w-full xs:w-1/2 sm:w-1/3 xl:w-1/7 2xl:w-1/7"
      /> -->
      <!-- <generalTabsMenusettings
        :selectedTab="selectedTab"
        @changeTab="toggleTab($event)"
        tabName="menusettings"
        tabDisplay="Menu instellingen"
        class="w-full xs:w-1/2 sm:w-1/3 xl:w-1/7 2xl:w-1/7"
      /> -->
    </div>
    <settingsLocations
      v-if="
        selectedTab == 'locations' &&
        hasAccessToComponent('generalSettings_locations_showLocations')
      "
      id="locations"
    />
    <settingsRooms v-if="selectedTab == 'rooms'" id="rooms" />
  </div>
</template>

<script>
import { useUserStore } from "@/store/user";

export default {
  setup() {
    const userStore = useUserStore();

    const selectedTab = ref("locations");

    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);

    const toggleTab = (e) => {
      selectedTab.value = e;
      const el = document.getElementById(selectedTab.value);
      // TODO: not working somehow
      if (el) {
        el.scrollIntoView();
      }
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

    return { selectedTab, toggleTab, hasAccessToComponent };
  },
};
</script>

<style scoped>
</style>