<template>
  <section class="relative">
    <div
      class="fixed bottom-4 right-4 bg-white p-2 rounded-lg shadow-mainBlack z-9999 w-40 flex items-center justify-start"
      v-if="progress"
    >
      <div
        class="bg-palettes-theme-accent h-4 transition-all duration-300"
        :style="`width: ${(progress.value / progress.total) * 100}%`"
      ></div>
      <div class="absolute text-center flex justify-center text-sm font-bold">
        {{ `${Math.floor((progress.value / progress.total) * 100)}%` }}
        <!-- {{ progress.total }} -->
      </div>
    </div>
    <generalConfirmDialog
      class="z-9882 fixed top-0 left-0"
      v-if="confirmDialogOptions.show"
      @cancel="closeConfirmDialog"
      @confirm="confirmDeleteBooking"
      :options="confirmDialogOptions"
    />
    <generalOptionsDialog
      class="z-9882 fixed top-0 left-0"
      v-if="optionsDialogOptions.show"
      @cancel="closeOptionsDialog"
      @performAction="performAction($event)"
      :options="optionsDialogOptions"
    />
    <calendarAddBooking
      @closeOverlay="closeBookingBar()"
      @updateBookings="getAllBookings()"
      @updateProgress="updateProgress($event)"
      @hideProgress="hideProgress()"
      :rooms="rooms"
      :allRoomsAccessible="allRooms"
      :allAccessibleRoomsInt="allAccessibleRoomsInt"
      :perks="perks"
      :admins="admins"
      class="transform transition-all z-9881 top-0 fixed"
      :class="showNewBookingBar ? 'right-0' : '-right-full'"
      :selectedDay="selectedDay"
      :selectedMonth="selectedMonth"
      :selectedYear="selectedYear"
      :preSetData="preSetData"
    />
    <calendarShowBooking
      @closeOverlay="closeOpenBookingBar($event)"
      @toggleDelete="toggleDelete($event)"
      @toggleRepeatModalEdit="toggleRepeatModalEdit()"
      @toggleRepeatModalDelete="toggleRepeatModalDelete()"
      @closeEditModal="closeEditModal()"
      @closeDeleteModal="closeDeleteModal()"
      @updateBookings="getAllBookings()"
      @preSetBooking="cloneBooking($event)"
      class="transform transition-all z-9881 top-0 fixed"
      :class="showOpenBookingBar ? 'right-0' : '-right-full'"
      :booking="openedBooking"
      :rooms="rooms"
      :allRoomsAccessible="allRooms"
      :allAccessibleRoomsInt="allAccessibleRoomsInt"
      :perks="perks"
      :admins="admins"
      :mayShowEdit="mayShowEdit"
      :updateList="updateList"
    />
    <!-- Main content -->
    <div
      class="bg-white dark:bg-black rounded-xl shadow-mainBlack dark:shadow-mainWhite p-4"
    >
      <h1
        class="font-semibold uppercase my-8 text-lg md:text-xl text-gray-title dark:text-standards-gray-mid relative z-1000 print:hidden"
      >
        Kalender
      </h1>

      <div
        class="flex flex-col xs:flex-row items-center justify-end gap-4 mb-4 relative z-30 print:hidden"
      >
        <calendarMonthNavigation
          class="order-4 xs:order-1"
          :selectedDay="selectedDay"
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          :months="months"
          @changeMonth="setSelectedMonth($event)"
          @changeYear="setSelectedYear($event)"
          @changeDay="setSelectedDay($event)"
        />
        <div class="flex gap-4 items-center order-2 self-end">
          <div
            @click="jumpToToday"
            class="flex item-center gap-2 cursor-pointer text-standards-gray-dark order-1 xs:order-2 bg-standards-gray-label dark:bg-standards-gray-mid bg-opacity-30 p-2 rounded-xl shadow-mainBlack dark:shadow-mainWhite"
          >
            <icon name="solar:radar-2-outline" class="h-6 w-6" />
            <span class="hidden sm:block">Vandaag</span>
          </div>
          <calendarViewToggle
            :selectedView="selectedView"
            @changeView="setSelectedView($event)"
            class="order-2 xs:order-3"
          />
          <div
            @click="toggleNewBooking()"
            class="order-3 text-standards-gray-dark font-normal bg-palettes-theme-primary p-2 rounded-xl shadow-mainBlack dark:shadow-mainWhite flex-items-center w-max cursor-pointer"
            v-if="
              hasAccessToComponent('calendar_reservationsView_createBooking')
            "
          >
            <icon
              name="solar:calendar-add-broken"
              class="block sm:hidden w-6 h-6"
            />
            <span class="hidden sm:inline"> Toevoegen </span>
          </div>
        </div>
      </div>

      <template v-if="selectedView.name == 'daylist'">
        <calendarDayLint
          :selectedDay="selectedDay"
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          :weekdays="weekdays"
          @changeDay="setSelectedDay($event)"
          class="relative z-20"
        />
        <calendarDayView
          class="relative z-10"
          :selectedDay="selectedDay"
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          :bookings="bookings"
          :openedBooking="openedBooking"
          @toggleOpenBooking="toggleOpenBooking($event)"
          :rooms="rooms"
        />
      </template>
      <template v-if="selectedView.name == 'locationlist'">
        <calendarDayLint
          :selectedDay="selectedDay"
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          :weekdays="weekdays"
          @changeDay="setSelectedDay($event)"
          class="relative z-20"
        />
        <calendarLocationView
          class="relative z-10"
          :selectedDay="selectedDay"
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          :openedBooking="openedBooking"
          :bookings="bookings"
          @toggleOpenBooking="toggleOpenBooking($event)"
          :rooms="rooms"
        />
      </template>
      <template v-if="selectedView.name == 'monthlist'">
        <calendarMonthView
          class="relative z-10"
          :selectedDay="selectedDay"
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          :openedBooking="openedBooking"
          :bookings="bookings"
          @toggleOpenBooking="toggleOpenBooking($event)"
          @openDayView="openDayView($event)"
          :rooms="rooms"
        />
      </template>
      <template v-if="selectedView.name == 'printview'">
        <calendarPrintView
          class="relative z-10"
          :selectedDay="selectedDay"
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          :bookings="bookings"
          :openedBooking="openedBooking"
          :weekdays="weekdays"
          :trackingInt="trackingInt"
          @toggleOpenBooking="toggleOpenBooking($event)"
        />
      </template>
    </div>
  </section>
</template>

<script>
import { useGeneralStore } from "@/store/general";
import { useUserStore } from "@/store/user";

export default {
  setup(props, { emit }) {
    const { $authDirect } = useNuxtApp();
    const snackbar = useSnackbar();
    const userStore = useUserStore();
    const generalStore = useGeneralStore();

    const rooms = ref([]);
    const allRooms = ref([]);
    const allAccessibleRoomsInt = ref(0);
    const perks = ref([]);
    const admins = ref([]);
    const selectedMonth = ref("");
    const selectedYear = ref("");
    const selectedDay = ref("");
    const selectedView = ref("");
    const currentDate = new Date();
    const currentDay = currentDate.getDate().toString().padStart(2, "0");
    const currentMonth = (currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0");
    const currentYear = currentDate.getFullYear().toString();
    const showNewBookingBar = ref(false);
    const showOpenBookingBar = ref(false);
    const openedBooking = ref(null);
    const preSetData = ref(null);
    const bookings = ref([]);
    const deleteID = ref("");
    const deleteType = ref("");
    const confirmDialogOptions = ref({
      show: false,
      title: "",
      description: "",
      buttons: [],
      cancelText: "",
      confirmText: "",
    });
    const updateList = ref("");
    const optionsDialogOptions = ref({
      show: false,
      title: "",
      description: "",
      buttons: [],
    });
    const mayShowEdit = ref(false);
    const mayShowDelete = ref(false);
    const weekdays = [
      "Maandag",
      "Dinsdag",
      "Woensdag",
      "Donderdag",
      "Vrijdag",
      "Zaterdag",
      "Zondag",
    ];
    const months = [
      { value: 1, display: "Januari" },
      { value: 2, display: "Februari" },
      { value: 3, display: "Maart" },
      { value: 4, display: "April" },
      { value: 5, display: "Mei" },
      { value: 6, display: "Juni" },
      { value: 7, display: "Juli" },
      { value: 8, display: "Augustus" },
      { value: 9, display: "September" },
      { value: 10, display: "Oktober" },
      { value: 11, display: "November" },
      { value: 12, display: "December" },
    ];
    const trackingInt = ref(1);
    const progress = ref(null);
    const userRights = computed(() => userStore.GET_ACCOUNT_RIGHTS);

    const setSelectedMonth = (month) => {
      selectedMonth.value = +month;
    };

    const setSelectedYear = (year) => {
      selectedYear.value = year;
    };

    const setSelectedDay = (day) => {
      selectedDay.value = day;
    };

    const setSelectedView = (view) => {
      selectedView.value = view;
    };

    const updateProgress = (e) => {
      progress.value = {
        value: e.value,
        total: e.total,
      };
    };

    const hideProgress = () => {
      progress.value = null;
    };

    const jumpToToday = () => {
      selectedDay.value = currentDay;
      selectedMonth.value = currentMonth;
      selectedYear.value = currentYear;
      trackingInt.value++;
    };

    const toggleDelete = (booking, type) => {
      deleteID.value = booking;
      deleteType.value = type;
      confirmDialogOptions.value.title = "Boeking verwijderen";
      confirmDialogOptions.value.description = `Weet je zeker dat je boeking "${booking.name}" wilt verwijderen? Deze actie kan niet ongedaan gemaakt worden.`;
      confirmDialogOptions.value.cancelText = "Annuleren";
      confirmDialogOptions.value.confirmText = "Verwijderen";
      confirmDialogOptions.value.show = true;
    };

    const closeEditModal = () => {
      updateList.value = "";
      mayShowEdit.value = false;
    };

    const closeDeleteModal = () => {
      mayShowDelete.value = false;
    };

    const toggleRepeatModalEdit = () => {
      const bookingGroup = bookings.value.filter((booking) => {
        if (booking.bookingGroup) {
          return booking.bookingGroup == openedBooking.value.bookingGroup;
        } else {
          return false;
        }
      });
      if (bookingGroup.length > 1) {
        optionsDialogOptions.value.title = "Herhalende boeking wijzigen";
        optionsDialogOptions.value.description = `Deze boeking is onderdeel van een reeks. Welke boeking wil je wijzigen?`;
        optionsDialogOptions.value.buttons = [
          { value: "Alleen geselecteerde", method: "editCurrent" },
          {
            value: "Geselecteerde en alle volgende",
            method: "editCurrentAndNext",
          },
          { value: "Alle boekingen in deze reeks", method: "editAll" },
        ];
        optionsDialogOptions.value.cancelText = "Annuleren";
        optionsDialogOptions.value.confirmText = "Verwijderen";
        optionsDialogOptions.value.show = true;
      } else {
        mayShowEdit.value = true;
      }
    };

    const toggleRepeatModalDelete = () => {
      const bookingGroup = bookings.value.filter((booking) => {
        if (booking.bookingGroup) {
          return booking.bookingGroup == openedBooking.value.bookingGroup;
        } else {
          return false;
        }
      });
      if (bookingGroup.length > 1) {
        optionsDialogOptions.value.title = "Herhalende boeking verwijderen";
        optionsDialogOptions.value.description = `Deze boeking is onderdeel van een reeks. Welke boeking(en) wil je verwijderen?`;
        optionsDialogOptions.value.buttons = [
          { value: "Alleen geselecteerde", method: "deleteCurrent" },
          {
            value: "Geselecteerde en alle volgende",
            method: "deleteCurrentAndNext",
          },
          { value: "Alle boekingen in deze reeks", method: "deleteAll" },
        ];
        optionsDialogOptions.value.show = true;
      } else {
        // mayShowDelete.value = true;
        toggleDelete(openedBooking.value, "single");
      }
    };

    const performAction = (e) => {
      if (e == "editCurrent" || e == "editCurrentAndNext" || e == "editAll") {
        updateList.value = e;
        closeOptionsDialog();
        mayShowEdit.value = true;
      } else if (
        e == "deleteCurrent" ||
        e == "deleteCurrentAndNext" ||
        e == "deleteAll"
      ) {
        toggleDelete(openedBooking.value, e);
        closeOptionsDialog();
      }
    };

    const toggleNewBooking = () => {
      showNewBookingBar.value = true;
      generalStore.HIDE_MENU_BTN();
    };

    const cloneBooking = (e) => {
      preSetData.value = e;
      toggleNewBooking();
    };

    const toggleOpenBooking = (booking) => {
      showOpenBookingBar.value = true;
      openedBooking.value = booking;
      generalStore.HIDE_MENU_BTN();
    };

    const closeConfirmDialog = () => {
      deleteID.value = "";
      deleteType.value = "";
      confirmDialogOptions.value.title = "";
      confirmDialogOptions.value.description = "";
      confirmDialogOptions.value.cancelText = "";
      confirmDialogOptions.value.confirmText = "";
      confirmDialogOptions.value.show = false;
    };

    const closeOptionsDialog = () => {
      optionsDialogOptions.value.title = "";
      optionsDialogOptions.value.description = "";
      optionsDialogOptions.value.buttons = [];
      optionsDialogOptions.value.show = false;
      mayShowEdit.value = false;
    };

    const closeBookingBar = () => {
      showNewBookingBar.value = false;
      preSetData.value = null;
      generalStore.SHOW_MENU_BTN();
    };

    const closeOpenBookingBar = (e) => {
      showOpenBookingBar.value = false;
      openedBooking.value = null;
      updateList.value = "";
      generalStore.SHOW_MENU_BTN();
      // if e == true, it means the editmodal was opened. Only then it should reload the bookings, to make sure that unsaved modifications are restored and adjustments are shown
      if (e) {
        getAllBookings();
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

    const openDayView = (e) => {
      setSelectedDay(e.day);
      setSelectedMonth(e.month);
      setSelectedYear(e.year);
      setSelectedView({
        name: "daylist",
        display: "Daglijst",
        icon: "solar:list-line-duotone",
      });
    };

    const confirmDeleteBooking = async () => {
      await $fetch("/api/deleteBooking", {
        method: "post",
        body: {
          auth: $authDirect(),
          booking: deleteID.value,
          type: deleteType.value,
        },
      }).then(async (res) => {
        const returnBody = JSON.parse(res.body);
        closeOpenBookingBar(true);
        closeConfirmDialog();
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        }
      });
    };

    const getRoomsForUser = async () => {
      await $fetch("/api/getRooms", {
        method: "post",
        body: { auth: $authDirect(), location: generalStore.GET_LOCATION },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          rooms.value = returnBody;
          rooms.value.sort((a, b) => {
            return a.position - b.position;
          });
        }
      });
    };

    const getAllRooms = async () => {
      await $fetch("/api/getAllRoomsForAccessibleLocations", {
        method: "post",
        body: { auth: $authDirect() },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          allRooms.value = returnBody.filter((rooms) => {
            if (rooms.name != generalStore.GET_LOCATION.name) {
              allAccessibleRoomsInt.value += rooms.rooms.length;
              return {
                name: rooms.name,
                rooms: rooms.rooms.sort((a, b) => {
                  return a.position - b.position;
                }),
              };
            }
          });

          // TODO: sort them
          // rooms.value.sort((a, b) => {
          //   return a.position - b.position;
          // });
        }
      });
    };

    const getAllPerks = async () => {
      await $fetch("/api/getPerks", {
        method: "post",
        body: { auth: $authDirect(), location: generalStore.GET_LOCATION },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          perks.value = returnBody;
          perks.value.sort((a, b) => {
            return a.position - b.position;
          });
          const modifiedArray = [];
          perks.value.map((perk) => {
            let obj = {};
            obj = {
              ...perk,
              count: 0,
            };
            modifiedArray.push(obj);
          });
          perks.value = modifiedArray;
        }
      });
    };

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
          admins.value.sort((a, b) => {
            return a.firstname.localeCompare(b.firstname);
          });
        }
      });
    };

    watch(
      () => generalStore.GET_LOCATION,
      async (n) => {
        if (n && hasAccessToComponent("calendar_roomSettings_showRooms")) {
          await getRoomsForUser();
        }
        if (
          n &&
          hasAccessToComponent("calendar_reservationsView_crossLocation")
        ) {
          await getAllRooms();
        }
        if (n && hasAccessToComponent("calendar_roomSettings_showPerks")) {
          await getAllPerks();
        }
        if (
          n &&
          hasAccessToComponent("userManagement_adminAccess_showAdmins")
        ) {
          await getAllAdmins();
        }
        if (
          generalStore.GET_LOCATION &&
          hasAccessToComponent("calendar_reservationsView_showBookings")
        ) {
          await getAllBookings();
        }
      }
    );

    onMounted(async () => {
      if (
        generalStore.GET_LOCATION &&
        hasAccessToComponent("calendar_reservationsView_showBookings")
      ) {
        await getAllBookings();
      }
      if (
        generalStore.GET_LOCATION &&
        hasAccessToComponent("calendar_roomSettings_showRooms")
      ) {
        await getRoomsForUser();
      }
      if (
        generalStore.GET_LOCATION &&
        hasAccessToComponent("calendar_reservationsView_crossLocation")
      ) {
        await getAllRooms();
      }
      if (
        generalStore.GET_LOCATION &&
        hasAccessToComponent("calendar_roomSettings_showPerks")
      ) {
        await getAllPerks();
      }
      if (hasAccessToComponent("userManagement_adminAccess_showAdmins")) {
        await getAllAdmins();
      }
      const today = new Date();
      const dayNumber = today.getDate();
      selectedDay.value = dayNumber;
    });

    const getAllBookings = async () => {
      mayShowEdit.value = false;
      await $fetch("/api/getBookings", {
        method: "post",
        body: { auth: $authDirect(), location: generalStore.GET_LOCATION },
      }).then((res) => {
        const returnBody = JSON.parse(res.body);
        if (returnBody.snackbar) {
          snackbar.add(returnBody.snackbar);
        } else {
          bookings.value = returnBody;
        }
      });
    };

    return {
      bookings,
      setSelectedMonth,
      setSelectedYear,
      setSelectedDay,
      setSelectedView,
      selectedMonth,
      selectedYear,
      selectedDay,
      selectedView,
      showNewBookingBar,
      showOpenBookingBar,
      jumpToToday,
      toggleNewBooking,
      toggleOpenBooking,
      closeBookingBar,
      closeOpenBookingBar,
      getAllBookings,
      openedBooking,
      rooms,
      allRooms,
      perks,
      admins,
      deleteID,
      confirmDialogOptions,
      optionsDialogOptions,
      toggleDelete,
      toggleRepeatModalEdit,
      toggleRepeatModalDelete,
      closeConfirmDialog,
      closeOptionsDialog,
      confirmDeleteBooking,
      hasAccessToComponent,
      performAction,
      mayShowEdit,
      updateList,
      closeEditModal,
      closeDeleteModal,
      openDayView,
      months,
      weekdays,
      trackingInt,
      cloneBooking,
      preSetData,
      allAccessibleRoomsInt,
      progress,
      updateProgress,
      hideProgress,
    };
  },
};
</script>

<style scoped>
</style>