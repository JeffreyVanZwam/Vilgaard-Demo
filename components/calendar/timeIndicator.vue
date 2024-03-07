<template>
  <div class="timeIndicator" :style="`left:${currentTime}`"></div>
</template>

<script>
export default {
  setup() {
    const currentTime = ref("");

    const updateCurrentTime = () => {
      const now = Date.now();
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0); //set the start time to midnight

      const timeDifference = now - startDate.getTime();
      const pixelDifference = timeDifference / 1000 / 60 / 15;
      const offset = `${pixelDifference * 3 + 6}rem`; //pixelDifference * the number of pixels for each timezone (it's width) + padding-left
      currentTime.value = offset;
    };

    const startTimer = () => {
      setInterval(() => {
        updateCurrentTime();
      }, 1000); // update time every second
    };

    onBeforeMount(() => {
      updateCurrentTime();
    });

    onMounted(async () => {
      await startTimer();
    });

    return { currentTime };
  },
};
</script>

<style scoped>
.timeIndicator {
  @apply bg-red-400;
  height: 100%;
  width: 1px;
  position: absolute;
  background-color: #e75757;
  box-shadow: 0px 0px 4px 0.25px #e75757;
}
</style>