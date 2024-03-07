<template>
  <div
    class="relative text-standards-gray-dark dark:text-standards-gray-mid flex flex-col items-center"
  >
    <div
      class="select-none cursor-pointer font-normal flex items-center gap-2 bg-palettes-theme-accent p-2 rounded-xl shadow-mainBlack dark:shadow-mainWhite"
      @click="showViewTypes = !showViewTypes"
    >
      <icon :name="selectedViewType.icon" class="w-6 h-6" />
      <span class="hidden sm:block">
        {{ selectedViewType.display }}
      </span>
    </div>
    <div
      class="absolute top-12 bg-white dark:bg-black p-2 rounded-xl shadow-mainBlack dark:shadow-mainWhite grid grid-cols-1 gap-2 w-max"
      v-if="showViewTypes"
    >
      <div
        @click="toggleView(view)"
        class="cursor-pointer hover:bg-palettes-theme-accent-hover p-1 rounded-lg flex items-center gap-2"
        v-for="view in viewTypes"
        :key="view.name"
      >
        <icon :name="view.icon" class="w-5 h-5" />
        <span>
          {{ view.display }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "@/store/user";

export default {
  props: ["selectedView"],

  setup(props, { emit }) {
    const userStore = useUserStore();
    const selectedViewToProp = toRefs(props).selectedView;

    const viewTypes = [
      {
        name: "daylist",
        display: "Dagweergave",
        icon: "solar:list-bold-duotone",
      },
      {
        name: "printview",
        display: "Weekweergave",
        icon: "solar:printer-2-bold-duotone",
      },
      {
        name: "monthlist",
        display: "Maandweergave",
        icon: "solar:calendar-bold-duotone",
      },
      {
        name: "locationlist",
        display: "Locatieweergave",
        icon: "solar:posts-carousel-horizontal-bold-duotone",
      },
    ];
    const selectedViewType = ref();
    const showViewTypes = ref(false);

    const toggleView = (view) => {
      selectedViewType.value = view;
      showViewTypes.value = false;
      emit("changeView", view);
    };

    onBeforeMount(() => {
      const view = userStore.GET_CALENDARBASE;
      if (view) {
        toggleView(view);
      }
    });

    watch(selectedViewToProp, (n) => {
      selectedViewType.value = n;
      showViewTypes.value = false;
    });

    return { viewTypes, toggleView, showViewTypes, selectedViewType };
  },
};
</script>

<style scoped>
</style>