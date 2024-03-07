import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    accountType: "",
    accountRights: [],
    firstname: "",
    lastname: "",
    startpage: "dashboard",
    calendarbase: {
      name: "daylist",
      display: "Dagweergave",
      icon: "solar:list-bold-duotone",
    },
    idleDuration: 900000,
  }),

  getters: {
    GET_ACCOUNT_TYPE: (state) => state.accountType,

    GET_ACCOUNT_RIGHTS: (state) => state.accountRights,

    GET_USER_FIRSTNAME: (state) => state.firstname,

    GET_USER_LASTNAME: (state) => state.lastname,

    GET_STARTPAGE: (state) => state.startpage,

    GET_CALENDARBASE: (state) => state.calendarbase,

    GET_IDLEDURATION: (state) => state.idleDuration,
  },

  actions: {
    SET_ACCOUNT_TYPE(type) {
      this.accountType = type;
    },

    SET_ACCOUNT_RIGHTS(rights) {
      this.accountRights = rights;
    },

    SET_USER_FIRSTNAME(name) {
      this.firstname = name;
    },

    SET_USER_LASTNAME(name) {
      this.lastname = name;
    },

    SET_STARTPAGE(page) {
      this.startpage = page;
    },

    SET_CALENDARBASE(view) {
      this.calendarbase = view;
    },

    SET_IDLEDURATION(int) {
      this.idleDuration = int;
    },
  },
});
