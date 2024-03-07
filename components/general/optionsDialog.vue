<template>
  <div
    class="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-max"
  >
    <generalDarkOverlay @click="cancel()" />
    <div
      class="bg-white shadow-mainBlack dark:shadow-mainWhite rounded p-4 relative z-9882 max-w-3/4"
    >
      <h1 class="text-palettes-theme-gray font-medium text-xl">
        {{ options.title }}
      </h1>
      <p class="text-standards-gray-label font-normal text-base leading-6 my-5">
        {{ options.description }}
      </p>
      <div class="flex flex-col items-end gap-4 justify-end">
        <button
          v-for="button in options.buttons"
          @click="performAction(button.method)"
          :key="button.method"
          class="bg-standards-gray-label bg-opacity-100 cursor-pointer rounded-lg text-white uppercase font-medium text-sm px-5 h-9.5 transition-all"
        >
          {{ button.value }}
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
    const performAction = (e) => {
      emit("performAction", e);
    };

    const cancel = () => {
      emit("cancel");
    };

    return { performAction, cancel };
  },
};
</script>

<style scoped>
</style>