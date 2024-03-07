<template>
  <div class="w-full flex flex-col gap-1 bg-standards-gray-label bg-opacity-20">
    <div class="flex justify-between bg-white dark:bg-black">
      <div
        v-for="(day, index) in weekdays"
        :key="index"
        class="flex items-center dark:text-white justify-center w-full py-2 font-semibold border-b-2 border-palettes-theme-primary"
      >
        {{ day }}
      </div>
    </div>
    <div
      v-for="(week, weekIndex) in calendar"
      :key="weekIndex"
      class="w-full grid grid-cols-7 h-32 gap-1 select-none"
    >
      <div
        v-for="day in week"
        class="w-full flex flex-col sm:flex-row items-end sm:items-start justify-start sm:justify-end relative p-2"
        :class="
          day.currentMonth
            ? 'bg-white dark:bg-black'
            : 'bg-standards-gray-label dark:bg-palettes-theme-black bg-opacity-5'
        "
        :key="day.month + '-' + day.number"
      >
        <span
          @click="goToDate(day.year, day.month, day.number)"
          class="relative sm:absolute top-0 left-0 p-2 font-bold z-10 dark:text-white cursor-pointer"
          >{{ day.number }}</span
        >
        <div class="flex flex-col items-end gap-0.5" style="max-width: 90%">
          <div
            class="overflow-hidden p-0.5 rounded-lg h-5 cursor-pointer max-w-full"
            :class="
              booking == openedBooking
                ? 'bg-palettes-theme-accent'
                : 'bg-palettes-theme-primary'
            "
            v-for="booking in getBookings(
              day.number,
              day.month,
              day.year
            ).splice(0, 4)"
            :key="booking.name + '_' + day.number + '-' + day.month"
            @dblclick="openBooking(booking)"
          >
            <div class="text-xs text-end">
              {{ booking.name }}
            </div>
          </div>
          <div
            class="overflow-hidden py-0.5 px-1.5 rounded-lg h-5 bg-standards-gray-label flex items-center"
            v-if="getBookings(day.number, day.month, day.year).length > 4"
            @mouseover="toggleShowAllBookings(day.number, day.month, day.year)"
          >
            <span class="text-xs text-white">
              {{
                `+${getBookings(day.number, day.month, day.year).length - 4}`
              }}
            </span>
          </div>
          <div
            class="absolute bottom-0 z-20 bg-white p-2 shadow-mainBlack flex flex-col gap-1 max-w-full"
            v-if="showAllBookings == `${day.number}${day.month}${day.year}`"
            @mouseleave="showAllBookings = ''"
          >
            <div
              class="p-0.5 rounded-lg h-5 cursor-pointer overflow-hidden"
              :class="
                booking == openedBooking
                  ? 'bg-palettes-theme-accent'
                  : 'bg-palettes-theme-primary'
              "
              v-for="booking in getBookings(day.number, day.month, day.year)"
              :key="
                'fullscreen_' +
                booking.name +
                '_' +
                day.number +
                '-' +
                day.month
              "
              @dblclick="openBooking(booking)"
            >
              <div class="text-xs text-end">
                {{ booking.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    "selectedMonth",
    "selectedYear",
    "selectedDay",
    "bookings",
    "openedBooking",
    "rooms",
  ],

  setup(props, { emit }) {
    const weekdays = ["M", "D", "W", "D", "V", "Z", "Z"];
    const selectMonth = toRefs(props).selectedMonth;
    const selectYear = toRefs(props).selectedYear;
    const allBookings = toRefs(props).bookings;
    const showAllBookings = ref();

    const calendar = computed(() => {
      const calendar = [];
      const logical_month = selectMonth.value - 1;
      const year = selectYear.value;

      // get first day of month and first week day
      const first_day = new Date(year, logical_month, 1);
      const first_day_weekday =
        first_day.getDay() == 0 ? 7 : first_day.getDay();

      // find number of days in month
      const month_length = new Date(year, selectMonth.value, 0).getDate();
      const previous_month_length = new Date(year, logical_month, 0).getDate();

      // define default day variables
      let day = 1; // current month days
      let prev = 1; // previous month days
      let next = 1; // next month days

      // weeks loop (rows)
      for (var i = 0; i < 9; i++) {
        // weekdays loop (cells)
        const currentWeek = [];
        const previousWeek = [];
        const nextWeek = [];
        for (var j = 1; j <= 7; j++) {
          if (day <= month_length && (i > 0 || j >= first_day_weekday)) {
            // current month
            currentWeek.push({
              number: day,
              month: selectMonth.value,
              year: selectYear.value,
              currentMonth: true,
            });
            day++;
          } else {
            if (day <= month_length) {
              // previous month
              previousWeek.push({
                number: previous_month_length - first_day_weekday + prev + 1,
                month: logical_month,
                year:
                  logical_month == 0 ? selectYear.value - 1 : selectYear.value,
                currentMonth: false,
              });
              prev++;
            } else {
              // next month
              nextWeek.push({
                number: next,
                month: selectMonth.value + 1,
                year:
                  selectMonth.value == 12
                    ? selectYear.value + 1
                    : selectYear.value,
                currentMonth: false,
              });
              next++;
            }
          }
        }

        let arr;
        if (previousWeek.length != 0) {
          arr = [...previousWeek, ...currentWeek];
        } else if (nextWeek.length != 0) {
          arr = [...currentWeek, ...nextWeek];
        } else {
          arr = [...currentWeek];
        }
        calendar.push(arr);

        // stop making rows if it's the end of month
        if (day > month_length) {
          break;
        }
      }
      return calendar;
    });

    const toggleShowAllBookings = (day, month, year) => {
      if (showAllBookings.value == `${day}${month}${year}`) {
        showAllBookings.value = "";
      } else {
        showAllBookings.value = `${day}${month}${year}`;
      }
    };

    const getBookings = (day, month, year) => {
      const sortedBookingsSet = new Set();
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

          const selectedDay = new Date(year, month - 1, day);

          // Check if the selected day is within the booking's date range
          const isBetweenDates =
            (selectedDay >= fromDate && selectedDay <= toDate) ||
            selectedDay.toDateString() === fromDate.toDateString();

          if (isBetweenDates) {
            sortedBookingsSet.add(booking);
          }
        }
      });
      const sortedBookings = Array.from(sortedBookingsSet);
      return sortedBookings;
    };

    const openBooking = (booking) => {
      emit("toggleOpenBooking", booking);
    };

    const goToDate = (year, month, number) => {
      emit("openDayView", { year: year, month: month, day: number });
    };

    return {
      weekdays,
      calendar,
      getBookings,
      openBooking,
      goToDate,
      showAllBookings,
      toggleShowAllBookings,
    };
  },
};
</script>

<style scoped>
</style>