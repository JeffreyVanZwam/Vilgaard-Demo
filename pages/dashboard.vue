<template>
  <section
    class="w-full grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 grid-rows-none gap-4 lg:gap-8"
  >
    <!-- <div
      class="absolute top-4 left-4 p-4 bg-red-500 z-9999 cursor-pointer border-4 border-red-600 outline-2 outline-offset-2 outline-white"
      @click="fillEmptyTS"
    >
      Herschrijf ts (dayjs)
    </div> -->

    <!-- <div
      class="absolute top-4 left-4 p-4 bg-red-500 z-9999 cursor-pointer border-4 border-red-600 outline-2 outline-offset-2 outline-white"
      @click="rewriteToFNS"
    >
      Herschrijf ts (fns)
    </div> -->

    <!-- <div
      class="absolute top-12 left-4 p-4 bg-blue-500 z-9999 cursor-pointer border-4 border-blue-600 outline-2 outline-offset-2 outline-white"
      @click="runDayjsTest"
    >
      Start DayJS test
    </div> -->

    <!-- <div
      class="col-span-1 xs:col-span-2 sm:col-span-1 lg:col-span-2 row-span-1 row-start-1 bg-white p-4 rounded-xl shadow-mainBlack dark:shadow-mainWhite"
    >
      Blok 1
    </div> -->

    <div
      class="col-span-1 xs:col-span-2 sm:col-span-1 lg:col-span-2 row-span-1 row-start-2 sm:row-start-1 col-start-1 lg:col-start-3 bg-white dark:bg-black rounded-xl shadow-mainBlack dark:shadow-mainWhite"
    >
      <dashboardQuickviewCalendar />
    </div>
    <div
      v-if="hasAccessToComponent('userManagement_adminAccess_showAdmins')"
      class="col-span-1 row-span-1 col-start-1 row-start-3 xs:col-span-2 sm:row-start-1 sm:col-span-2 lg:row-start-1 lg:col-start-5"
    >
      <dashboardQuickviewUsers />
    </div>
  </section>
</template>

<script>
import { useUserStore } from "@/store/user";

export default {
  setup() {
    const userStore = useUserStore();
    const { $authDirect } = useNuxtApp();

    const fillEmptyTS = async () => {
      await $fetch("/api/fillEmptyTS", {
        method: "post",
        body: {
          auth: $authDirect(),
        },
      }).then((res) => {
        console.log("resultaat van fillEmptyTS:", res);
      });
    };

    const rewriteToFNS = async () => {
      await $fetch("/api/rewriteToFNS", {
        method: "post",
        body: {
          auth: $authDirect(),
        },
      }).then((res) => {
        console.log("resultaat van rewriteToFNS:", res);
      });
    };

    const runDayjsTest = async () => {
      await $fetch("/api/dayjstest", {
        method: "post",
        body: {
          auth: $authDirect(),
        },
      }).then((res) => {
        console.log("resultaat van dayjstest:", res);
      });
    };

    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);

    const hasAccessToComponent = (rightName) => {
      let value = false;
      userRights.value.map((right) => {
        if (right.name == rightName) {
          value = true;
        }
      });
      return value;
    };

    return { hasAccessToComponent, fillEmptyTS, runDayjsTest, rewriteToFNS };
  },
};
</script>

<style scoped>
</style>