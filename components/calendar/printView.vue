<template>
  <div>
    <!-- calendar month view -->
    <div class="flex items-center justify-between pt-12 print:pt-0">
      <div
        class="font-bold text-xl print:text-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center"
      >
        <h2>
          {{ selectedWeekVisual }}
        </h2>
        <!-- print button -->
        <icon
          name="solar:printer-2-line-duotone"
          class="w-6 h-6 cursor-pointer block print:hidden print:invisible"
          @click="print()"
        />
      </div>
      <div class="w-max flex flex-col gap-0.5 text-sm print:text-xs">
        <div class="flex justify-between bg-white dark:bg-black">
          <div
            v-for="(day, index) in weekdays"
            :key="index"
            class="flex items-center dark:text-white justify-center w-full py-0.5 font-semibold border-b-2 border-palettes-theme-primary"
          >
            {{ day[0] }}
          </div>
        </div>
        <div
          v-for="(week, weekIndex) in calendar"
          :key="weekIndex"
          class="grid grid-cols-7 gap-1 select-none hover:bg-palettes-theme-accent group cursor-pointer"
          @click="toggleWeek(week, weekIndex)"
        >
          <div
            v-for="day in week"
            class="bg-white dark:bg-black group-hover:bg-palettes-theme-accent flex flex-col sm:flex-row items-center justify-center relative"
            :class="
              selectedWeekIndex == weekIndex ? ' font-bold' : 'font-normal'
            "
            :key="day.month + '-' + day.number"
          >
            <span
              v-if="day.currentMonth"
              class="relative p-0.5 print:p-0 z-10 dark:text-white"
              >{{ day.number }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Booking grid -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 mt-4 text-base print:text-sm"
    >
      <div
        class="border p-4 rounded-md"
        v-for="(day, i) in selectedWeek.slice(0, 5)"
      >
        <h2 class="font-semibold mb-2 text-palettes-theme-primary">
          {{ `${weekdays[i]} ${day.number}-${day.month}` }}
        </h2>
        <div class="flex flex-col gap-2">
          <span
            v-if="getBookings(day.number, day.month, day.year).length == 0"
            class="font-extralight italic text-sm print:text-xs"
            >Geen reserveringen</span
          >

          <div
            v-for="booking in getBookings(day.number, day.month, day.year)"
            class="text-sm print:text-xs group hover:underline cursor-pointer select-none"
            :class="
              booking == openedBooking
                ? ' text-palettes-theme-accent-hover'
                : ' text-palettes-theme-gray'
            "
            @dblclick="openBooking(booking)"
          >
            <span class="font-semibold min-w-max mr-2">{{
              `${booking.dateFh}:${booking.dateFi} - ${booking.dateTh}:${booking.dateTi}`
            }}</span>
            <span class="font-semibold mr-2">{{ booking.name }}</span>

            <span class="font-extralight" v-for="(room, i) in booking.rooms">{{
              i + 1 < booking.rooms.length ? room.name + ", " : room.name
            }}</span>
          </div>
        </div>
      </div>
      <div class="border flex flex-col rounded-md">
        <div
          class="first:border-b p-4"
          v-for="(day, i) in selectedWeek.slice(5, 7)"
        >
          <h2 class="font-semibold mb-2 text-palettes-theme-primary">
            {{ `${weekdays[i + 5]} ${day.number}-${day.month}` }}
          </h2>
          <div class="flex flex-col gap-2">
            <span
              v-if="getBookings(day.number, day.month, day.year).length == 0"
              class="font-extralight italic text-sm print:text-xs"
              >Geen reserveringen</span
            >
            <div
              v-for="booking in getBookings(day.number, day.month, day.year)"
              class="text-sm print:text-xs group hover:underline cursor-pointer select-none"
              :class="
                booking == openedBooking
                  ? ' text-palettes-theme-accent-hover'
                  : ' text-palettes-theme-gray'
              "
              @dblclick="openBooking(booking)"
            >
              <span class="font-semibold min-w-max mr-2">{{
                `${booking.dateFh}:${booking.dateFi} - ${booking.dateTh}:${booking.dateTi}`
              }}</span>
              <span class="font-semibold mr-2">{{ booking.name }}</span>

              <span
                class="font-extralight"
                v-for="(room, i) in booking.rooms"
                >{{
                  i + 1 < booking.rooms.length ? room.name + ", " : room.name
                }}</span
              >
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
    "weekdays",
    "trackingInt",
  ],

  setup(props, { emit }) {
    const selectDay = toRefs(props).selectedDay;
    const selectMonth = toRefs(props).selectedMonth;
    const selectYear = toRefs(props).selectedYear;
    const trackInt = toRefs(props).trackingInt;
    const selectedWeek = ref([]);
    const selectedWeekIndex = ref(0);
    const allBookings = toRefs(props).bookings;

    const print = () => {
      window.print();
    };

    const calendar = computed(() => {
      const calendar = [];
      let logical_month = selectMonth.value - 1;
      if (logical_month < 0) {
        logical_month == 11;
      }
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
              number: String(+day).padStart(2, 0),
              month: String(+selectMonth.value).padStart(2, 0),
              year: selectYear.value,
              currentMonth: true,
            });
            day++;
          } else {
            if (day <= month_length) {
              // previous month
              previousWeek.push({
                number: previous_month_length - first_day_weekday + prev + 1,
                month: String(+logical_month).padStart(2, 0),
                year:
                  logical_month == 0 ? selectYear.value - 1 : selectYear.value,
                currentMonth: false,
              });
              prev++;
            } else {
              // next month
              nextWeek.push({
                number: String(+next).padStart(2, 0),
                month: String(+selectMonth.value + 1).padStart(2, 0),
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

    const selectedWeekVisual = computed(() => {
      return `${selectedWeek.value[0].number}/${selectedWeek.value[0].month}/${selectedWeek.value[0].year} - ${selectedWeek.value[6].number}/${selectedWeek.value[6].month}/${selectedWeek.value[6].year}`;
    });

    const toggleWeek = (week, weekIndex) => {
      selectedWeek.value = week;
      selectedWeekIndex.value = weekIndex;
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
      sortedBookings.sort((a, b) => {
        return a.tsFrom - b.tsFrom;
      });

      return sortedBookings;
    };

    const openBooking = (booking) => {
      emit("toggleOpenBooking", booking);
    };

    const setCurrentWeek = () => {
      let i = 0;

      calendar.value.map((week) => {
        week.map((day) => {
          if (
            day.number == props.selectedDay &&
            day.month == props.selectedMonth
          ) {
            i = calendar.value.indexOf(week);
          }
        });
      });

      selectedWeekIndex.value = i;
      selectedWeek.value = calendar.value[i];
    };

    watch(selectDay, () => {
      let i = 0;
      calendar.value.map((week) => {
        week.map((day) => {
          if (
            day.number == props.selectedDay &&
            day.month == props.selectedMonth
          ) {
            i = calendar.value.indexOf(week);
          }
        });
      });

      selectedWeekIndex.value = i;
      selectedWeek.value = calendar.value[i];
    });

    watch(trackInt, () => {
      setCurrentWeek();
    });

    onBeforeMount(() => {
      setCurrentWeek();
    });

    return {
      print,
      calendar,
      toggleWeek,
      selectedWeek,
      selectedWeekVisual,
      selectedWeekIndex,
      allBookings,
      getBookings,
      openBooking,
    };
  },
};
</script>

<style  scoped>
</style>