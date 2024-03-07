<template>
  <div
    class="flex items-center justify-center rounded-md h-9 gap-2 transition-all"
    :class="
      selectedTab == tabName
        ? 'bg-palettes-theme-secondary text-white cursor-default'
        : 'bg-white text-palettes-theme-gray hover:bg-palettes-theme-accent hover:bg-opacity-10 cursor-pointer'
    "
    @click="$emit('changeTab', tabName)"
  >
    <Icon
      name="solar:bug-line-duotone"
      class="h-4 w-4 transition-all"
      :class="
        selectedTab == tabName
          ? '  text-white'
          : ' text-standards-gray-midnight'
      "
    />

    <span class="uppercase font-medium text-sm">{{ tabDisplay }}</span>
  </div>
</template>

<script>
export default {
  props: {
    selectedTab: String,
    tabName: String,
    tabDisplay: String,
  },

  setup() {
    return {};
  },
};
</script>

<style  scoped>
</style>