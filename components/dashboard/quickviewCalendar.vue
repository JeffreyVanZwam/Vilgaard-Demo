<template>
  <div class="p-4 relative overflow-hidden h-full">
    <icon
      name="solar:calendar-broken"
      class="text-standards-gray-label dark:text-standards-gray-mid h-20 w-20 absolute top-0 left-0 opacity-10"
    />
    <span
      class="text-lg sm:text-xl lg:text-2xl text-gray-title dark:text-palettes-theme-white font-semibold mt-12"
      >Afspraken van vandaag</span
    >
    <div
      class="flex flex-col gap-2 my-4 relative z-10"
      v-if="bookings.length != 0"
    >
      <div
        class="shadow-mainBlack dark:shadow-mainWhite bg-palettes-theme-white dark:bg-palettes-theme-black p-2 rounded-lg"
        v-for="booking in bookings"
        :key="booking.id"
      >
        <h2 class="text-palettes-theme-primary text-base sm:text-lg">
          {{ booking.name }}
        </h2>
        <h3
          class="text-xs sm:text-sm font-semibold dark:text-palettes-theme-white"
        >
          {{
            `${booking.dateFd}-${booking.dateFm}-${booking.dateFy.replace(
              "20",
              "'"
            )} ${booking.dateFh}:${booking.dateFi} / ${booking.dateTd}-${
              booking.dateTm
            }-${booking.dateTy.replace("20", "'")} ${booking.dateTh}:${
              booking.dateTi
            }`
          }}
        </h3>
        <div class="flex items-center gap-2">
          <h4
            class="py-1 px-2 rounded-md bg-palettes-theme-accent text-xs sm:text-sm"
            v-for="room in booking.rooms"
            :key="room.name + '_' + booking.name"
          >
            {{ room.name }}
          </h4>
        </div>
      </div>
    </div>
    <div
      class="text-base font-light text-palettes-theme-gray dark:text-palettes-theme-white"
      v-else
    >
      Geen boekingen voor vandaag
    </div>
    <div class="flex justify-end">
      <nuxt-link to="/kalender">
        <icon
          name="solar:double-alt-arrow-right-bold-duotone"
          class="w-8 h-8 cursor-pointer text-palettes-theme-secondary"
        />
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "@/store/user";
import { useGeneralStore } from "@/store/general";
import { storeToRefs } from "pinia";

export default {
  setup() {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();
    const userStore = useUserStore();
    const generalStore = useGeneralStore();

    const bookings = ref([]);
    const { location } = storeToRefs(generalStore);

    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);

    watch(location, (n) => {
      if (n) {
        if (hasAccessToComponent("calendar_reservationsView_showBookings")) {
          getTodaysBookings();
        }
      }
    });

    const getTodaysBookings = async () => {
      await $fetch("/api/getTodaysBookings", {
        method: "post",
        body: { auth: $authDirect(), location: generalStore.GET_LOCATION },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          bookings.value = returnBody;
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

    onBeforeMount(() => {
      if (generalStore && generalStore.GET_LOCATION) {
        if (hasAccessToComponent("calendar_reservationsView_showBookings")) {
          getTodaysBookings();
        }
      }
    });

    return { bookings };
  },
};
</script>

<style scoped>
</style>