<template>
  <nav>
    <!-- TOggle BTN -->
    <div
      class="fixed w-11 h-11 p-2.5 flex items-center justify-center text-center top-13 md:top-9 left-4 md:left-3 z-9999 bg-white dark:bg-black rounded-3xl hover:rounded-lg hover:-rotate-6 cursor-pointer transition-all duration-200 ease-in-out text-palettes-theme-secondary fill-palettes-theme-secondary"
      :class="showMenuBTN ? 'visible md:visible' : 'invisible md:visible'"
      @click="toggleMenu"
    >
      <Icon
        name="solar:menu-dots-bold-duotone"
        class="fill-current w-11 h-11"
      />
    </div>

    <!-- navbar -->
    <div
      class="fixed z-9999 w-full md:w-80 transition-all duration-500 ease-in-out top-0 left-0 bottom-0 overflow-hidden shadow-mainBlack dark:shadow-mainWhite bg-white dark:bg-black"
      :class="
        menuOpen ? ' translate-x-0' : '-translate-x-full md:-translate-x-80'
      "
    >
      <router-link
        to="/dashboard"
        class="flex items-center gap-2 relative z-10 bg-white dark:bg-black"
      >
        <generalLogo class="h-24 p-4 pr-8" />
        <div class="uppercase font-bold">De Vilgaard</div>
      </router-link>

      <div
        class="h-full overflow-x-hidden overflow-y-scroll menuScroll pt-24 absolute w-full top-0 flex flex-col justify-between"
      >
        <Icon
          name="solar:close-circle-broken"
          class="absolute right-0 top-2 cursor-pointer z-9999 h-6 w-6 visible md:invisible dark:text-white"
          @click="toggleMenu"
        />

        <ul
          class="pr-12 pl-5 overflow-x-hidden overflow-y-auto navbarScroll fixed top-24 bottom-0 w-full"
        >
          <li
            class=""
            v-for="menuItem in menu"
            :key="menuItem.i18n['nl'].display"
          >
            <nuxt-link
              v-if="menuItem.i18n['nl'].link"
              :to="menuItem.i18n['nl'].link"
              class="flex items-center text-gray-800 dark:text-standards-gray-mid hover:text-gray-400 hover:bg-palettes-theme-accent transition-all duration-300 group p-4 rounded-2xl"
            >
              <Icon :name="menuItem.svg" class="h-6 w-6 fill-current mr-4" />
              <span> {{ menuItem.i18n["nl"].display }} </span>
            </nuxt-link>
            <div
              @click="
                toggleTab(
                  menuItem.i18n['nl'].display.replace(' ', '').toLowerCase()
                )
              "
              class="text-gray-800 dark:text-standards-gray-mid transition-all duration-300 group rounded-2xl"
              :class="
                tab ==
                menuItem.i18n['nl'].display.replace(' ', '').toLowerCase()
                  ? 'bg-gray-100 dark:bg-palettes-theme-black  hover:text-gray-400 hover:bg-gray-200'
                  : 'bg-palette-white dark:bg-black hover:text-gray-400 hover:bg-palettes-theme-accent dark:hover:bg-palettes-theme-accent'
              "
              v-else
            >
              <div
                class="flex items-center justify-start p-4 transition-all duration-300 relative cursor-pointer"
                :class="
                  tab ==
                  menuItem.i18n['nl'].display.replace(' ', '').toLowerCase()
                    ? 'pb-0'
                    : 'pb-4'
                "
              >
                <Icon
                  :name="menuItem.svg"
                  class="h-6 w-6 dark:text-standards-gray-mid mr-4"
                />
                <span> {{ menuItem.i18n["nl"].display }} </span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="transform transition-all duration-300 h-4 absolute right-4 fill-black dark:fill-white"
                  :class="
                    tab ==
                    menuItem.i18n['nl'].display.replace(' ', '').toLowerCase()
                      ? ' rotate-180'
                      : 'rotate-0'
                  "
                  viewBox="0 0 24 24"
                >
                  <path d="M24 24H0V0h24v24z" fill="none" opacity=".87" />
                  <path
                    d="M15.88 9.29L12 13.17 8.12 9.29c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41-.39-.38-1.03-.39-1.42 0z"
                  />
                </svg>
              </div>
              <ul
                class="transition-all overflow-hidden"
                :class="
                  tab ==
                  menuItem.i18n['nl'].display.replace(' ', '').toLowerCase()
                    ? ' max-h-96 py-2'
                    : 'max-h-0 py-0'
                "
              >
                <li
                  v-for="submenu in menuItem.subMenu"
                  :key="submenu.i18n['nl'].display"
                >
                  <nuxt-link
                    :to="submenu.i18n['nl'].link"
                    class="flex items-center text-gray-800 dark:text-palettes-theme-white hover:text-gray-400 dark:hover:text-white transition-all duration-300 group m-4 rounded-2xl"
                  >
                    <Icon
                      :name="submenu.svg"
                      class="h-6 w-6 fill-current mr-4"
                    />
                    <span> {{ submenu.i18n["nl"].display }} </span>
                  </nuxt-link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div
      class="w-full h-screen duration-500 ease-in-out fixed"
      :class="menuOpen ? 'z-9880 mainOverlayActive' : 'z-0 mainOverlayInactive'"
      @click="closeOverlay"
    ></div>
  </nav>
</template>

<script>
import { useGeneralStore } from "@/store/general";

export default {
  setup(props, { emit }) {
    const { $authDirect } = useNuxtApp();
    const route = useRoute();
    const snackbar = useSnackbar();
    const generalStore = useGeneralStore();

    const menuOpen = ref(false);
    const tab = ref(null);
    const menu = ref([]);

    const showMenuBTN = computed(() => generalStore.GET_SHOW_MENU_BTN);

    const toggleMenu = () => {
      emit("toggleMenu", {
        val: !menuOpen.value,
      });
      menuOpen.value = !menuOpen.value;
    };

    const closeOverlay = () => {
      emit("toggleMenu", {
        val: !menuOpen,
      });
      menuOpen.value = false;
    };

    const toggleTab = (name) => {
      if (tab.value == name) {
        tab.value = null;
      } else {
        tab.value = name;
      }
    };

    onBeforeMount(async () => {
      let filteredMenu;
      await $fetch("/api/getMenu", {
        method: "post",
        body: $authDirect(),
      }).then((res) => {
        filteredMenu = JSON.parse(res.body);
        if (filteredMenu.snackbar) {
          snackbar.add(filteredMenu.snackbar);
        } else {
        }
      });

      await filteredMenu.forEach((menuItem) => {
        if (menuItem.submenu) {
          menuItem.submenu.sort((a, b) => {
            return a.position - b.position;
          });
        }
      });
      await filteredMenu.sort((a, b) => {
        return a.position - b.position;
      });
      menu.value = filteredMenu;
    });

    watch(
      () => route.name,
      () => {
        closeOverlay();
      }
    );

    return {
      menuOpen,
      tab,
      menu,
      toggleMenu,
      closeOverlay,
      toggleTab,
      showMenuBTN,
    };
  },
};
</script>

<style>
.mainOverlayActive {
  backdrop-filter: blur(5px);
}
.mainOverlayInactive {
  backdrop-filter: blur(0px);
}

/* width */
.menuScroll::-webkit-scrollbar {
  width: 10px;
}

/* Track */
.menuScroll::-webkit-scrollbar-track {
  background: #ffffff;
}

.dark .menuScroll::-webkit-scrollbar-track {
  background: #000;
}

/* Handle */
.menuScroll::-webkit-scrollbar-thumb {
  border: solid 3px #ffffff;
  border-radius: 10px;
  background: var(--secondary);
}

/* Handle on hover */
.menuScroll::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}

navbarScroll::-webkit-scrollbar {
  inline-size: 14px;
}

navbarScroll::-webkit-scrollbar-track {
  background: #fff;
}

navbarScroll::-webkit-scrollbar-thumb {
  background: #efefef;
  border-radius: 12px;
  border: solid 5px #fff;
  transition: all 500ms ease-in-out;
}

navbarScroll::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}
</style>