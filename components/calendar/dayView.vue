<template>
  <div
    v-dragscroll
    class="relative overflow-hidden customScroll cursor-grab"
    ref="monthView"
  >
    <!-- current time indicator -->
    <calendarTimeIndicator v-if="isToday" />
    <!-- topbar | timezones -->
    <div class="flex items-center pl-24">
      <div
        class="w-12 min-w-12 relative select-none"
        v-for="time in timezones"
        :key="time"
      >
        <span
          class="absolute text-palettes-theme-gray dark:text-palettes-theme-white"
          v-if="time.split(':')[1] == '00'"
        >
          {{ time.split(":")[0] }}
        </span>
        <div class="text-xs mt-5 text-standards-gray-label">
          {{ time.split(":")[1] }}
        </div>
      </div>
    </div>
    <!-- left bar | rooms -->
    <div class="sticky left-0 w-max z-10 -translate-y-10">
      <div
        class="w-max bg-white dark:bg-black dark:text-palettes-theme-white border-r border-standards-gray-label border-opacity-25 sticky left-0 pt-10 -mb-10"
      >
        <div
          class="flex items-center justify-start w-12 xs:w-16 sm:w-20 lg:w-24 h-28"
          v-for="room in rooms"
          :key="room.name"
        >
          <div class="w-full">
            <span class="transform -rotate-90 block text-center">
              {{ room.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- bookings -->
    <div class="absolute top-0 left-0 w-max pl-24 pt-9">
      <div
        class="h-28 flex items-center"
        v-for="room in rooms"
        :key="room.name + '_lane'"
      >
        <div
          class="w-80 min-w-80 p-2 flex items-center"
          v-for="booking in getBookings(room.name)"
          @dblclick="openBooking(booking)"
          :key="booking.name"
        >
          <div
            class="p-4 bg-gradient-to-tr h-20 transition-all flex absolute overflow-hidden justify-between border-r-4"
            :class="[
              new Date(
                `${booking.dateFy}-${booking.dateFm}-${booking.dateFd}`
              ) < new Date(`${selectYear}-${selectMonth}-${selectDay} 00:00:00`)
                ? ' rounded-l-none'
                : 'rounded-l-lg',
              new Date(
                `${booking.dateTy}-${booking.dateTm}-${booking.dateTd}`
              ) > new Date(`${selectYear}-${selectMonth}-${selectDay} 23:59:59`)
                ? ' rounded-r-none'
                : 'rounded-r-lg',
              booking == openedBooking
                ? 'from-palettes-theme-accent to-palettes-theme-accent-hover shadow-mainBlack dark:shadow-mainWhite border-palettes-theme-accent-hover text-standards-gray-midnight border-b-[6px] border-r-palettes-theme-accent-hover'
                : 'from-palettes-theme-primary to-palettes-theme-secondary border-b-0 border-transparent text-white border-r-white dark:border-r-palettes-theme-black',
            ]"
            :style="`left:${calculateOffset(booking)};width:${calculateWidth(
              booking
            )}`"
          >
            <div class="flex flex-col justify-center w-full">
              <span class="font-medium text-sm">
                {{ booking.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "@/store/user";
import { dragscroll } from "vue-dragscroll";
import { getTime, startOfDay } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

export default {
  props: [
    "selectedMonth",
    "selectedYear",
    "selectedDay",
    "bookings",
    "openedBooking",
    "rooms",
  ],

  directives: {
    dragscroll,
  },

  setup(props, { emit }) {
    const userStore = useUserStore();

    const timezones = ref([]);
    const selectDay = toRefs(props).selectedDay;
    const selectMonth = toRefs(props).selectedMonth;
    const selectYear = toRefs(props).selectedYear;
    const allBookings = toRefs(props).bookings;
    const availableRooms = toRefs(props).rooms;
    const monthView = ref("");

    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);
    const isToday = computed(() => {
      const todayPre = new Date();
      const today = `${todayPre.getDate()}-${
        todayPre.getMonth() + 1
      }-${todayPre.getFullYear()}`;
      const selectedDay = `${selectDay.value}-${+selectMonth.value}-${
        selectYear.value
      }`;
      return selectedDay == today;
    });

    const getBookings = (room) => {
      const sortedBookings = [];
      allBookings.value.map((booking) => {
        for (const l of booking.rooms) {
          const fromDate = new Date(
            booking.dateFy,
            parseInt(booking.dateFm) - 1,
            booking.dateFd,
            booking.dateFh,
            booking.dateFi
          );
          const toDate = new Date(
            booking.dateTy,
            parseInt(booking.dateTm) - 1,
            booking.dateTd,
            booking.dateTh,
            booking.dateTi
          );

          const selectedDay = new Date(
            selectYear.value,
            selectMonth.value - 1,
            selectDay.value
          );

          const isBetweenDates =
            (selectedDay >= fromDate && selectedDay <= toDate) ||
            selectedDay.toDateString() === fromDate.toDateString();

          // Check if the selected day is within the booking's date range
          if (isBetweenDates && l.name.toLowerCase() == room.toLowerCase()) {
            sortedBookings.push(booking);
          }
        }
      });
      return sortedBookings;
    };

    const openBooking = (booking) => {
      emit("toggleOpenBooking", booking);
    };

    watch(selectDay, () => {
      // setScrollbarOffset();
      setCalendarGrid();
    });

    watch(selectMonth, () => {
      // setScrollbarOffset();
      setCalendarGrid();
    });

    watch(availableRooms, (n) => {
      if (n && n.length != 0) {
        setScrollbarOffset();
      }
    });

    watch(isToday, (n) => {
      // if (n) {
      setScrollbarOffset();
      setCalendarGrid;
      // }
    });

    onBeforeMount(() => {
      setCalendarGrid();
    });

    const setCalendarGrid = () => {
      timezones.value = [];
      const selectedDay = `${selectYear.value}-${
        selectMonth.value < 10 ? "0" + selectMonth.value : selectMonth.value
      }-${selectDay.value}`;
      const startDate = new Date(selectedDay);
      startDate.setHours(0, 0, 0, 0); //set the start time to midnight

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1); // set the end time to next day midnight

      const interval = 15 * 60 * 1000; // 15 minutes in milliseconds
      for (
        let time = startDate.getTime();
        time < endDate.getTime();
        time += interval
      ) {
        const currentTime = new Date(time);
        const formattedTime = currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        timezones.value.push(formattedTime);
      }
    };

    const setScrollbarOffset = () => {
      if (isToday.value) {
        const now = getTime(zonedTimeToUtc(Date.now(), "Europe/Amsterdam"));
        let startDate = new Date();
        startDate = getTime(startOfDay(startDate));

        const timeDifference = now - startDate;
        const pixelDifference = timeDifference / 1000 / 60 / 15;
        const offset = `${pixelDifference * 48}`; //pixelDifference * the number of pixels for each timezone (it's width) + padding-left

        monthView.value.scrollLeft = offset;
      } else {
        monthView.value.scrollLeft = 0;
      }
    };

    const calculateOffset = (date) => {
      const bookingStart = getTime(
        zonedTimeToUtc(
          `${date.dateFy}-${date.dateFm}-${date.dateFd} ${date.dateFh}:${date.dateFi}`,
          "Europe/Amsterdam"
        )
      );

      const selectedDay = `${selectYear.value}-${
        selectMonth.value < 10 ? "0" + selectMonth.value : selectMonth.value
      }-${selectDay.value}`;
      let startDate = getTime(
        startOfDay(zonedTimeToUtc(new Date(selectedDay), "Europe/Amsterdam"))
      );

      const timeDifference = bookingStart - startDate;
      const pixelDifference = timeDifference / 1000 / 60 / 15;
      let value = pixelDifference * 3 + 6; //pixelDifference * the number of pixels for each timezone (it's width) + padding-left
      if (value < 6) {
        value = 6;
      }
      let offset = `${value}rem`;
      return offset;
    };

    const calculateWidth = (date) => {
      const fromTime = `${date.dateFy}-${date.dateFm}-${date.dateFd} ${date.dateFh}:${date.dateFi}`;
      const toTime = `${date.dateTy}-${date.dateTm}-${date.dateTd} ${date.dateTh}:${date.dateTi}`;
      const selectedDay = `${selectYear.value}-${
        selectMonth.value < 10 ? "0" + selectMonth.value : selectMonth.value
      }-${selectDay.value}`;

      let bookingStart = new Date(fromTime);
      let bookingEnd = new Date(toTime);
      let bs, be;

      const selectedDateStart = new Date(selectedDay);
      const selectedDateEnd = new Date(selectedDay);
      selectedDateStart.setHours(0, 0, 0, 0);
      selectedDateEnd.setHours(23, 59, 59, 999);

      // als de startdatum overeenkomt met selecteddatum dan doe niets.
      // als de startdatum kleiner is dan de geselecteerde datum, dan zet starttijd op 00:00
      if (bookingStart < selectedDateStart) {
        bs = selectedDateStart;
      } else {
        bs = bookingStart;
      }

      if (bookingEnd > selectedDateEnd) {
        be = selectedDateEnd;
      } else {
        be = bookingEnd;
      }
      const timeDifference = be - bs;
      const pixelDifference = timeDifference / 1000 / 60 / 15;
      const width = `${pixelDifference * 3}rem`;

      return width;
    };

    onMounted(async () => {
      setScrollbarOffset();
    });

    return {
      timezones,
      isToday,
      getBookings,
      calculateOffset,
      calculateWidth,
      monthView,
      selectYear,
      selectMonth,
      selectDay,
      openBooking,
    };
  },
};
</script>

<style scoped>
</style>