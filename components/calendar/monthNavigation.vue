<template>
  <div
    class="flex items-center text-standards-gray-dark dark:text-standards-gray-mid gap-2"
  >
    <icon
      name="solar:square-alt-arrow-left-broken"
      class="h-8 w-8 cursor-pointer"
      @click="prevMonth"
    />
    <div class="flex gap-1 items-center w-36 justify-center relative">
      <span
        class="font-light text-lg text-end select-none cursor-pointer"
        @click="
          [(showMonthDropdown = !showMonthDropdown), (showYearDropdown = false)]
        "
        >{{ selectedMonth.display }}</span
      >
      <span
        class="font-light text-lg select-none cursor-pointer"
        @click="
          [(showYearDropdown = !showYearDropdown), (showMonthDropdown = false)]
        "
      >
        {{ selectedYear }}</span
      >
      <div
        class="absolute top-8 bg-white dark:bg-black p-2 rounded-xl shadow-mainBlack dark:shadow-mainWhite grid grid-cols-3 w-max gap-2"
        v-if="showMonthDropdown"
      >
        <div
          class="cursor-pointer hover:bg-palettes-theme-accent-hover p-1 rounded-lg"
          v-for="month in months"
          :key="month.value"
          @click="toggleMonth(month)"
        >
          {{ month.display }}
        </div>
      </div>
      <div
        class="absolute top-8 bg-white dark:bg-black p-2 rounded-xl shadow-mainBlack dark:shadow-mainWhite grid grid-cols-1 w-max gap-2 max-h-48 overflow-y-auto customScroll justify-center items-center"
        v-if="showYearDropdown"
      >
        <div
          class="cursor-pointer hover:bg-palettes-theme-accent-hover p-1 rounded-lg"
          v-for="year in years"
          :key="year"
          @click="toggleYear(year)"
        >
          {{ year }}
        </div>
      </div>
    </div>
    <icon
      name="solar:square-alt-arrow-right-broken"
      class="h-8 w-8 cursor-pointer"
      @click="nextMonth"
    />
  </div>
</template>

<script>
export default {
  props: ["selectedDay", "selectedMonth", "selectedYear", "months"],
  setup(props, { emit }) {
    const selectedMonth = ref("");
    const selectedYear = ref("");
    const showMonthDropdown = ref(false);
    const showYearDropdown = ref(false);
    const incomingDay = toRefs(props).selectedDay;
    const incomingMonth = toRefs(props).selectedMonth;
    const incomingYear = toRefs(props).selectedYear;

    watch(incomingMonth, (n) => {
      selectedMonth.value = props.months.find((month) => {
        return month.value == n;
      });
      emit("changeMonth", n);
      showMonthDropdown.value = false;
    });

    watch(incomingYear, (n) => {
      toggleYear(n);
    });

    const years = ref([]);

    const prevMonth = () => {
      let prevValue;
      if (selectedMonth.value.value == 1) {
        prevValue = 12;
        selectedYear.value--;
      } else {
        prevValue = selectedMonth.value.value - 1;
      }
      selectedMonth.value = props.months.filter(
        (month) => month.value == prevValue
      )[0];
      emit("changeMonth", selectedMonth.value.value);
      emit("changeYear", selectedYear.value);
    };

    const nextMonth = () => {
      let nextValue;
      if (selectedMonth.value.value == 12) {
        nextValue = 1;
        selectedYear.value++;
      } else {
        nextValue = selectedMonth.value.value + 1;
      }
      selectedMonth.value = props.months.filter(
        (month) => month.value == nextValue
      )[0];
      emit("changeMonth", selectedMonth.value.value);
      emit("changeYear", selectedYear.value);
    };

    const toggleMonth = (month) => {
      selectedMonth.value = month;
      emit("changeMonth", selectedMonth.value.value);
      showMonthDropdown.value = false;
    };

    const toggleYear = (year) => {
      selectedYear.value = year;
      emit("changeYear", selectedYear.value);
      showYearDropdown.value = false;
    };

    onMounted(() => {
      const date = new Date();
      let currentDay = date.getDate();
      let currentMonth = date.getMonth() + 1;
      let currentYear = date.getFullYear();
      selectedMonth.value = props.months.filter(
        (month) => month.value == currentMonth
      )[0];
      selectedYear.value = currentYear;
      emit("changeYear", selectedYear.value);
      emit("changeMonth", selectedMonth.value.value);
      emit("changeDay", currentDay);
    });

    onMounted(() => {
      for (let index = 2023; index <= 2100; index++) {
        years.value.push(index);
      }
    });

    return {
      selectedMonth,
      selectedYear,
      prevMonth,
      nextMonth,
      showMonthDropdown,
      showYearDropdown,
      years,
      toggleMonth,
      toggleYear,
    };
  },
};
</script>

<style scoped>
</style>