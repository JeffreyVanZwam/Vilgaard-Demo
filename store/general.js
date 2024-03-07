import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", {
  state: () => ({ showMenuBTN: true, showUserProfile: null, location: null }),
  getters: {
    GET_SHOW_MENU_BTN: (state) => state.showMenuBTN,

    GET_SHOW_USER_PROFILE: (state) => state.showUserProfile,

    GET_LOCATION: (state) => state.location,
  },
  actions: {
    SHOW_MENU_BTN() {
      this.showMenuBTN = true;
    },

    HIDE_MENU_BTN() {
      this.showMenuBTN = false;
    },

    SET_USER_PROFILE(user) {
      this.showUserProfile = user;
    },

    CHANGE_LOCATION(location) {
      this.location = location;
    },
  },
});
