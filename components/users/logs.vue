<template>
  <div class="flex flex-col gap-4">
    <section
      class="bg-white dark:bg-black rounded-xl shadow-mainBlack dark:shadow-mainWhite overflow-hidden p-4"
    >
      <h1
        class="text-xl font-medium text-palettes-theme-gray dark:text-palettes-theme-white mb-4"
      >
        Activiteiten tijdlijn
      </h1>
      <div class="flex overflow-x-auto hScroll mb-4">
        <div
          v-for="(month, index) in monthTabs"
          :key="index"
          class="bg-standards-gray-label dark:bg-standards-gray-midnight border-2 rounded-lg border-white dark:border-black text-standards-gray-midnight dark:text-standards-gray-mid p-2 text-xs font-semibold min-w-28 transition-all cursor-pointer flex justify-center"
          :class="
            month.int + '/' + month.year == activeTabIndex
              ? ' bg-opacity-100'
              : ' bg-opacity-50'
          "
          @click="setActiveTab(month.int, month.year)"
        >
          {{ `${month.display} ${String(month.year).replace("20", "'")}` }}
        </div>
      </div>

      <div class="max-h-80 overflow-y-auto customScroll px-2">
        <div class="font-extralight" v-if="sortedActionlog.length == 0">
          Geen logs voor deze maand
        </div>
        <div
          v-else
          class="pb-8 relative border-l-4 border-standards-gray-label dark:border-standards-gray-midnight border-opacity-30 pl-6"
          v-for="log in sortedActionlog"
          :key="log.id"
        >
          <div
            class="rounded-full bg-palettes-theme-accent h-4 w-4 absolute top-0 -left-2.5 shadow-white-circular dark:shadow-black-circular"
          ></div>

          <div
            class="flex flex-col sm:flex-row gap-2 justify-between items-start"
          >
            <div class="flex gap-2 items-center order-2 sm:order-1">
              <Icon
                :name="getIcon(log.performedAction)"
                class="text-palettes-theme-secondary min-h-5 min-w-5 h-5 w-5"
              />
              <span
                class="text-sm sm:text:md text-standards-gray-midnight dark:text-standards-gray-mid"
              >
                {{ checkForUser(log) }}
              </span>
            </div>
            <div
              class="min-w-max text-xs sm:text-sm font-semibold text-standards-gray-label order-1 sm:order-2"
            >
              {{ convertDate(log.ts) }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  props: {
    user: Object,
  },

  setup(props, { emit }) {
    const route = useRoute();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const startYear = 2023;
    const endYear = currentYear;
    const monthNames = [
      "januari",
      "februari",
      "maart",
      "april",
      "mei",
      "juni",
      "juli",
      "augustus",
      "september",
      "oktober",
      "november",
      "december",
    ];

    const activeTabIndex = ref(currentMonth + "/" + currentYear);
    const sortedActionlog = computed(() => {
      const selectedMonth = activeTabIndex.value.split("/")[0];
      const selectedYear = activeTabIndex.value.split("/")[1];

      return props.user.actionLog
        .filter((log) => {
          const logDate = new Date(log.ts);
          return (
            logDate.getMonth() + 1 == selectedMonth &&
            logDate.getFullYear() == selectedYear
          );
        })
        .sort((a, b) => {
          return new Date(b.ts) - new Date(a.ts);
        });
    });

    const monthTabs = computed(() => {
      const arr = [];
      for (let year = startYear; year <= endYear; year++) {
        const startMonth = year === startYear ? 4 : 0;
        const endMonth = year === endYear ? currentMonth : 12;

        for (let month = startMonth; month < endMonth; month++) {
          const display = monthNames[month];
          const int = month + 1;
          arr.push({ display, int, year });
        }
      }
      return arr.reverse();
    });

    const checkForUser = (log) => {
      if (log.userId == props.user.id && route.path.includes("profiel")) {
        return `Je ${log.performedAction.i18n["3dPersonDescriptive"]["nl"]
          .replace("heeft", "hebt")
          .replace("zijn", "jouw")}`;
      } else {
        return `${props.user.firstname ? props.user.firstname : "Gebruiker"} ${
          log.performedAction.i18n["3dPersonDescriptive"]["nl"]
        }`;
      }
    };

    const setActiveTab = (month, year) => {
      activeTabIndex.value = month + "/" + year;
    };

    const getIcon = (logType) => {
      switch (logType.name) {
        case "user-login":
          return "solar:login-3-line-duotone";
          break;
        case "user-change-own-password":
          return "solar:password-minimalistic-line-duotone";
          break;
        case "admin-changes-user-password":
          return "solar:password-line-duotone";
          break;
        case "create-role":
          return "solar:shield-plus-line-duotone";
          break;
        case "edit-role":
          return "solar:shield-warning-line-duotone";
          break;
        case "delete-role":
          return "solar:shield-cross-line-duotone";
          break;
        case "user-password-changed-by-admin":
          return "solar:password-line-duotone";
          break;
        case "user-change-own-email":
          return "solar:smartphone-update-line-duotone";
          break;
        case "create-room":
          return "solar:streets-map-point-line-duotone";
          break;
        case "create-booking":
          return "solar:calendar-add-line-duotone";
          break;
        case "delete-room":
          return "solar:notification-remove-line-duotone";
          break;
        case "edit-room":
          return "solar:signpost-2-line-duotone";
          break;
        case "create-perk":
          return "solar:chair-line-duotone";
          break;
        case "edit-perk":
          return "solar:smartphone-rotate-angle-broken";
          break;
        case "delete-perk":
          return "solar:notification-remove-line-duotone";
          break;
        case "create-location":
          return "solar:buildings-2-line-duotone";
          break;
        case "delete-location":
          return "solar:home-line-duotone";
          break;
        case "edit-location":
          return "solar:pen-line-duotone";
          break;
        case "delete-booking":
          return "solar:notification-lines-remove-line-duotone";
          break;
        case "edit-booking":
          return "solar:pen-new-square-line-duotone";
          break;
        default:
        // code block
      }
    };

    const convertDate = (ts) => {
      let date = new Date(ts);
      let day = date.getDate();
      if (day < 10) day = "0" + day;
      let month = date.getMonth() + 1;
      if (month < 10) month = "0" + month;
      let hour = date.getHours();
      if (hour < 10) hour = "0" + hour;
      let minutes = date.getMinutes();
      if (minutes < 10) minutes = "0" + minutes;
      return `${day}-${month}-${date.getFullYear()} ${hour}:${minutes}`;
    };
    return {
      convertDate,
      sortedActionlog,
      getIcon,
      checkForUser,
      monthTabs,
      activeTabIndex,
      setActiveTab,
    };
  },
};
</script>

<style scoped>
.hScroll::-webkit-scrollbar {
  inline-size: 10px;
}

.hScroll::-webkit-scrollbar-track {
  background: #fff;
}

.dark .hScroll::-webkit-scrollbar-track {
  background: #000;
}

.hScroll::-webkit-scrollbar-thumb {
  background: var(--gray);
  border-radius: 20px;
  border: solid 7px #fff;
  transition: all 500ms ease-in-out;
}

.dark .hScroll::-webkit-scrollbar-thumb {
  background: var(--white);
  border-radius: 20px;
  border: solid 7px #000;
  transition: all 500ms ease-in-out;
}

.hScroll::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}
</style>