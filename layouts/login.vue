<template>
  <div class="">
    <VitePwaManifest />
    <slot class="font-publicSans" />
    <NuxtSnackbar />
  </div>
</template>

<script>
export default {
  setup() {
    return {};
  },
};
</script>

<style scoped>
</style>