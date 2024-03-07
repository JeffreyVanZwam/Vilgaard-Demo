<template>
  <section
    class="relative grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-4"
  >
    <roomsRoomslist
      class="col-span-1 sm:col-span-2 lg:col-span-2"
      v-if="hasAccessToComponent('calendar_roomSettings_showRooms')"
    />
    <roomsAssemblee
      class="col-span-1 sm:col-span-2 lg:col-span-2"
      v-if="hasAccessToComponent('calendar_roomSettings_showPerks')"
    />
  </section>
</template>

<script>
import { useUserStore } from "@/store/user";

export default {
  setup() {
    const userStore = useUserStore();

    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);

    const hasAccessToComponent = (rightName) => {
      let value = false;
      userRights.value.map((right) => {
        if (right.name == rightName) {
          value = true;
        }
      });
      return value;
    };

    return { hasAccessToComponent };
  },
};
</script>

<style scoped>
</style>