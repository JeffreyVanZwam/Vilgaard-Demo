<template>
  <div class="overflow-y-auto dayLintScroll">
    <div class="flex w-full justify-between">
      <div class="w-full min-w-8" v-for="day in daysInMonth">
        <div
          class="text-center cursor-pointer flex flex-col gap-0"
          :class="
            selectedDay == day
              ? 'text-palettes-theme-secondary'
              : 'text-standards-gray-label dark:text-standards-gray-mid'
          "
          @click="toggleDay(day)"
        >
          <span class="text-[10px] uppercase -mb-1.5">
            {{ getDayname(day) }}
          </span>
          <span class="">
            {{ day }}
          </span>
        </div>
        <div
          class="h-1 border-t-0"
          :class="
            selectedDay == day
              ? 'border-2 border-palettes-theme-secondary'
              : 'border border-standards-gray-label border-opacity-25'
          "
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["selectedMonth", "selectedYear", "selectedDay", "weekdays"],
  setup(props, { emit }) {
    const selectDay = toRefs(props).selectedDay;
    const selectMonth = toRefs(props).selectedMonth;
    const selectYear = toRefs(props).selectedYear;

    const storeSelectedDay = ref("");
    const daysInMonth = computed(() => {
      const date = new Date(+props.selectedYear, +props.selectedMonth, 0);
      return date.getDate();
    });

    const getDayname = (day) => {
      const date = new Date(+props.selectedYear, +props.selectedMonth - 1, day);
      const dayIndex = (date.getDay() + 6) % 7; // Adjust dayIndex to start from Monday (0 for Monday, 6 for Sunday)
      return props.weekdays[dayIndex].slice(0, 2);
    };

    const toggleDay = (day) => {
      storeSelectedDay.value = day;
      emit("changeDay", day);
    };

    watch(selectDay, (n) => {
      storeSelectedDay.value = selectDay.value;
    });

    watch(selectMonth, (n) => {
      if (daysInMonth.value < props.selectedDay) {
        emit("changeDay", daysInMonth.value);
      } else {
        emit("changeDay", storeSelectedDay.value);
      }
    });

    watch(selectYear, (n) => {
      //   console.log("y:", n);
    });

    return { daysInMonth, toggleDay, getDayname };
  },
};
</script>

<style scoped>
.dayLintScroll::-webkit-scrollbar {
  inline-size: 5px;
}

.dayLintScroll::-webkit-scrollbar-track {
  background: #fff;
}

.dayLintScroll::-webkit-scrollbar-thumb {
  background: var(--grey-100);
  border-radius: 12px;
  border: solid 7px #fff;
  transition: all 500ms ease-in-out;
}

.dayLintScroll::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}
</style>