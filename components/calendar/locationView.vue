<template>
  <div class="w-full p-4 overflow-x-auto customScroll cursor-grab" v-dragscroll>
    <div class="flex items-start gap-4">
      <div class="w-60 min-w-60 xs:w-80 xs:min-w-80" v-for="room in rooms">
        <div
          class="h-12 flex items-center justify-center border-b-2 border-palettes-theme-primary text-standards-gray-midnight dark:text-standards-gray-mid font-semibold"
        >
          {{ room.name }}
        </div>
        <div
          class="w-60 min-w-60 xs:w-80 xs:min-w-80 p-2 flex flex-col gap-4 border-b-2 dark:border-b-palettes-theme-black select-none transition-all"
          v-for="booking in getBookings(room.name)"
          @dblclick="openBooking(booking)"
          :key="booking.name"
        >
          <div class="">
            <div
              class="text-sm xs:text-base font-light text-standards-gray-label"
            >
              {{
                `${booking.dateFd}-${booking.dateFm}-${booking.dateFy.replace(
                  "20",
                  "'"
                )} ${
                  booking.fullDay
                    ? "Hele dag"
                    : booking.dateFh + ":" + booking.dateFi
                } || ${booking.dateTd}-${
                  booking.dateTm
                }-${booking.dateTy.replace("20", "'")} ${
                  booking.fullDay
                    ? "Hele dag"
                    : booking.dateTh + ":" + booking.dateTi
                }`
              }}
            </div>
            <h1
              class="font-semibold text-base xs:text-lg"
              :class="
                booking == openedBooking
                  ? ' text-palettes-theme-accent-hover'
                  : ' text-standards-gray-midnight dark:text-standards-gray-light'
              "
            >
              {{ booking.name }}
            </h1>
            <p
              v-if="booking.description != ''"
              class="text-standards-gray-label italic font-light text-sm"
            >
              {{ booking.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { dragscroll } from "vue-dragscroll";
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
    const selectDay = toRefs(props).selectedDay;
    const selectMonth = toRefs(props).selectedMonth;
    const selectYear = toRefs(props).selectedYear;
    const allBookings = toRefs(props).bookings;

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

          // Check if the selected day is within the booking's date range
          const isBetweenDates =
            (selectedDay >= fromDate && selectedDay <= toDate) ||
            selectedDay.toDateString() === fromDate.toDateString();

          if (isBetweenDates && l.name.toLowerCase() == room.toLowerCase()) {
            sortedBookings.push(booking);
          }
        }
      });
      sortedBookings.sort((a, b) => {
        return a.tsFrom - b.tsFrom;
      });
      return sortedBookings;
    };

    const openBooking = (booking) => {
      emit("toggleOpenBooking", booking);
    };

    return { getBookings, openBooking };
  },
};
</script>

<style scoped>
</style>