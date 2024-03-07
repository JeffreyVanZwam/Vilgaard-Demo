<template>
  <div class="flex items-center justify-center">
    <div
      class="relative w-1/2 max-w-xs sm:max-w-sm p-4 bg-standards-gray-light shadow-mainBlack border-standards-gray-dark"
    >
      <Icon
        @click="closeIdle"
        name="solar:close-square-broken"
        class="absolute right-4 top-4 w-6 h-6 cursor-pointer"
      />
      <h1 class="text-red-400 font-semibold text-lg">Klop klop...</h1>
      <p class="font-semibold mt-4">
        Je bent een tijdje niet actief. Om veiligheidsredenen wordt je dadelijk
        uitgelogd.
      </p>
      <p class="font-light text-sm mt-4">
        {{
          `Klik deze melding weg binnen ${count} seconden om ingelogd te blijven`
        }}
      </p>
    </div>
  </div>
</template>

<script>
// VUE imports

// LIBRARIES imports
import { signOut } from "firebase/auth";
export default {
  components: {},

  props: [],

  setup(props, { emit }) {
    const router = useRouter();
    const { $authDirect } = useNuxtApp();

    let timeout = null;
    const counter = ref(60000);
    const counterVisual = ref(0);

    const count = computed(() => counterVisual.value / 1000);

    const closeIdle = () => {
      clearTimeout(timeout);
      emit("closeIdle");
    };

    const logOut = async () => {
      await signOut($authDirect());
      router.push("/");
    };

    onMounted(() => {
      timeout = setTimeout(logOut, counter.value);
      counterVisual.value = counter.value;
      setInterval(() => {
        counterVisual.value = counterVisual.value - 1000;
      }, 1000);
    });

    return { closeIdle, count };
  },
};
</script>

<style scoped>
</style>