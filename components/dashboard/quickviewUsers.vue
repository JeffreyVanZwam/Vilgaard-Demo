<template>
  <div
    class="bg-white dark:bg-black p-4 rounded-xl shadow-mainBlack dark:shadow-mainWhite flex flex-col justify-between relative"
  >
    <div class="absolute top-4 right-4 flex justify-end flex-row-reverse">
      <div
        class="order-2"
        v-for="(avatar, index) in selectedAvatars(admins)"
        :key="index"
        :style="`transform:translateX(${(index + 1) * 10}px); z-index: ${
          1000 + (index + 1)
        }`"
      >
        <div class="w-8 h-8 lg:w-12 lg:h-12 rounded-full">
          <img
            v-if="avatar.avatar && avatar.avatar != ''"
            class="rounded-full w-8 h-8 lg:h-12 lg:w-12 object-cover border-2 border-white dark:border-black"
            :src="avatar.avatar"
          />
          <div
            class="rounded-full h-8 w-8 lg:h-12 lg:w-12 object-cover border-2 border-white dark:border-black flex items-center justify-center bg-palettes-theme-secondary uppercase font-bold text-palettes-theme-gray text-sm lg:text-base"
            v-else
          >
            {{ getInitials(avatar) }}
          </div>
        </div>
      </div>
      <div
        class="order-1"
        v-if="admins.length > 3"
        :style="`transform:translateX(${0 * 10}px); z-index: ${1000 + 0}`"
      >
        <div class="w-8 h-8 lg:w-12 lg:h-12 rounded-full">
          <div
            class="rounded-full h-8 w-8 lg:h-12 lg:w-12 object-cover border-2 border-white dark:border-black flex items-center justify-center bg-standards-gray-label uppercase font-bold text-palettes-theme-gray text-sm lg:text-base"
          >
            {{ "+" + (admins.length - 3) }}
          </div>
        </div>
      </div>
    </div>
    <span
      class="text-4xl text-gray-title dark:text-white font-semibold mt-12"
      >{{ admins.length }}</span
    >

    <h2
      class="text-sm font-normal text-gray-h6 dark:text-palettes-theme-white order-last"
    >
      {{ `Gebruiker${admins.length == 1 ? "" : "s"}` }}
    </h2>
  </div>
</template>

<script>
import { useUserStore } from "@/store/user";

export default {
  setup() {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();
    const userStore = useUserStore();

    const admins = ref([]);

    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);

    const getAllAdmins = async () => {
      await $fetch("/api/getAdminUsers", {
        method: "post",
        body: $authDirect(),
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          admins.value = returnBody;
        }
      });
    };

    const selectedAvatars = (users) => {
      if (users.length <= 3) {
        return users;
      } else {
        return users.slice(0, 3);
      }
    };

    const hasAccessToComponent = (rightName) => {
      let value = false;
      userRights.value.map((right) => {
        if (right.name == rightName) {
          value = true;
        }
      });
      return value;
    };

    const getInitials = (user) => {
      let plainLastname;
      if (user.lastname && user.lastname != "") {
        const allLastnames = user.lastname.split(" ");
        const lastIndex = allLastnames.length - 1;
        plainLastname = allLastnames[lastIndex];
      }
      if (
        user.firstname &&
        user.firstname != "" &&
        plainLastname &&
        plainLastname != ""
      ) {
        return user.firstname.slice(0, 1) + plainLastname.slice(0, 1);
      } else if (
        user.firstname &&
        user.firstname != "" &&
        (!plainLastname || plainLastname == "")
      ) {
        return user.firstname.slice(0, 2);
      } else if (
        plainLastname &&
        plainLastname != "" &&
        (!user.firstname || user.firstname == "")
      ) {
        return plainLastname.slice(0, 2);
      } else {
        return user.email.slice(0, 2);
      }
    };

    onBeforeMount(() => {
      if (hasAccessToComponent("userManagement_adminAccess_showAdmins")) {
        getAllAdmins();
      }
    });
    return { admins, selectedAvatars, getInitials };
  },
};
</script>

<style scoped>
</style>