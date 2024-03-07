<template>
  <div
    class="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-max"
  >
    <generalDarkOverlay @click="cancel()" />
    <div
      class="bg-white shadow-mainBlack dark:shadow-mainWhite rounded p-4 relative z-9882 max-w-sm w-3/4"
    >
      <h1 class="text-palettes-theme-gray font-medium text-xl">
        {{ options.title }}
      </h1>
      <p class="text-standards-gray-label font-normal text-base leading-6 my-5">
        {{ options.description }}
      </p>
      <div class="flex flex-col md:flex-row items-center gap-4 justify-end">
        <button
          @click="confirm()"
          class="bg-palettes-theme-primary rounded-lg text-white uppercase font-medium text-sm px-5 h-9.5 transition-all"
          :class="
            isLoading
              ? ' bg-opacity-60 cursor-not-allowed'
              : ' bg-opacity-100 cursor-pointer'
          "
        >
          <Icon
            name="solar:hourglass-broken"
            class="h-6 w-6 text-white hourglass"
            v-if="isLoading"
          />

          <span v-else> {{ options.confirmText }}</span>
        </button>
        <button
          @click="cancel()"
          class="bg-standards-gray-label rounded-lg text-palettes-theme-gray uppercase font-medium text-sm px-5 h-9.5"
        >
          {{ options.cancelText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: Object,
  },

  setup(props, { emit }) {
    const isLoading = ref(false);

    const cancel = () => {
      emit("cancel");
    };

    const confirm = () => {
      isLoading.value = true;
      emit("confirm");
    };

    onMounted(() => {
      isLoading.value = false;
    });
    return { isLoading, cancel, confirm };
  },
};
</script>

<style scoped>
</style>