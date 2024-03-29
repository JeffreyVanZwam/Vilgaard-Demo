export default {
  menuitems() {
    return [
      {
        id: 1,
        position: 1,
        i18n: { nl: { display: "Dasboard", link: "/dashboard" } },
        svg: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><rect fill="none" height="24" width="24" /><path d="M12,3L6,7.58V6H4v3.11L1,11.4l1.21,1.59L4,11.62V21h16v-9.38l1.79,1.36L23,11.4L12,3z M18,19h-5v-4h-2v4H6v-8.9l6-4.58 l6,4.58V19z M10,1c0,1.66-1.34,3-3,3C6.45,4,6,4.45,6,5H4c0-1.66,1.34-3,3-3c0.55,0,1-0.45,1-1H10z" /></svg>',
        submenu: null,
        pageItems: [],
      },
      {
        id: 2,
        position: 2,
        i18n: { nl: { display: "Kalender", link: null } },
        svg: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><g><rect fill="none" height="24" width="24" /></g> <g> <g> <g> <path d="M3,14c0,1.3,0.84,2.4,2,2.82V20H3v2h6v-2H7v-3.18C8.16,16.4,9,15.3,9,14V6H3V14z M5,8h2v3H5V8z" /> </g> <g> <path d="M20.63,8.54l-0.95-0.32C19.28,8.09,19,7.71,19,7.28V3c0-0.55-0.45-1-1-1h-3c-0.55,0-1,0.45-1,1v4.28 c0,0.43-0.28,0.81-0.68,0.95l-0.95,0.32C11.55,8.82,11,9.58,11,10.44V20c0,1.1,0.9,2,2,2h7c1.1,0,2-0.9,2-2v-9.56 C22,9.58,21.45,8.82,20.63,8.54z M16,4h1v1h-1V4z M13,10.44l0.95-0.32C15.18,9.72,16,8.57,16,7.28V7h1v0.28 c0,1.29,0.82,2.44,2.05,2.85L20,10.44V12h-7V10.44z M20,20h-7v-2h7V20z" /> </g> </g> </g></svg>',
        submenu: [
          // {
          //   id: 3,
          //   position: 1,
          //   i18n: { nl: { display: "Wijncollectie", link: "/wijncollectie" } },
          //   svg: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><rect fill="none" height="24" width="24" /> <path d="M6,3l0,6c0,2.97,2.16,5.43,5,5.91V19H8v2h8v-2h-3v-4.09c2.84-0.48,5-2.94,5-5.91l0-6H6z M16,8H8l0-3h8C16,5,16,8,16,8z" /></svg>',
          //   pageItems: [],
          // },
          // {
          //   id: 4,
          //   position: 2,
          //   i18n: { nl: { display: "Inzendingen", link: "/inzendingen" } },
          //   svg: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><g><rect fill="none" height="24" width="24" /></g> <g> <g> <path d="M17.33,3.55c-0.94-0.6-1.99-1.04-3.12-1.3C13.59,2.11,13,2.59,13,3.23v0c0,0.45,0.3,0.87,0.74,0.97 c0.91,0.2,1.77,0.56,2.53,1.05c0.39,0.25,0.89,0.17,1.22-0.16l0,0C17.94,4.64,17.87,3.89,17.33,3.55z M20.77,11L20.77,11 c0.64,0,1.13-0.59,0.98-1.21c-0.26-1.12-0.7-2.17-1.3-3.12c-0.34-0.54-1.1-0.61-1.55-0.16l0,0c-0.32,0.32-0.4,0.83-0.16,1.22 c0.49,0.77,0.85,1.62,1.05,2.53C19.9,10.7,20.31,11,20.77,11z M18.9,17.49L18.9,17.49c0.45,0.45,1.21,0.38,1.55-0.15 c0.6-0.94,1.04-1.99,1.3-3.11c0.14-0.62-0.35-1.21-0.98-1.21h0c-0.45,0-0.87,0.3-0.97,0.74c-0.2,0.91-0.57,1.76-1.05,2.53 C18.5,16.66,18.58,17.17,18.9,17.49z M13,20.77L13,20.77c0,0.64,0.59,1.13,1.21,0.98c1.12-0.26,2.17-0.7,3.11-1.3 c0.54-0.34,0.61-1.1,0.16-1.55l0,0c-0.32-0.32-0.83-0.4-1.21-0.15c-0.76,0.49-1.61,0.85-2.53,1.05C13.3,19.9,13,20.31,13,20.77z M13,12V8c0-0.55-0.45-1-1-1h0c-0.55,0-1,0.45-1,1v4H9.41c-0.89,0-1.34,1.08-0.71,1.71l2.59,2.59c0.39,0.39,1.02,0.39,1.41,0 l2.59-2.59c0.63-0.63,0.18-1.71-0.71-1.71H13z M11,20.77L11,20.77c0,0.64-0.59,1.13-1.21,0.99C5.33,20.75,2,16.77,2,12 s3.33-8.75,7.79-9.75C10.41,2.11,11,2.59,11,3.23v0c0,0.46-0.31,0.87-0.76,0.97C6.67,5,4,8.19,4,12s2.67,7,6.24,7.8 C10.69,19.9,11,20.31,11,20.77z" /> </g> </g></svg>',
          //   pageItems: [
          //     {
          //       name: "winedata_submissions_acceptOrDeclineSubmissions",
          //       "3dPersonDescriptive": {
          //         nl: "mag een inzending goed- of afkeuren",
          //       },
          //     },
          //   ],
          // },
          // {
          //   id: 5,
          //   position: 3,
          //   i18n: {
          //     nl: {
          //       display: "Importeer CSV",
          //       link: "/import-csv",
          //     },
          //   },
          //   svg: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><g><rect fill="none" height="24" width="24" /></g> <g> <path d="M20,6h-8l-2-2H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z M20,18L4,18V6h5.17 l2,2H20V18z M9.41,14.42L11,12.84V17h2v-4.16l1.59,1.59L16,13.01L12.01,9L8,13.01L9.41,14.42z" /> </g></svg>',
          //   pageItems: [],
          // },
        ],
        pageItems: [],
      },
      {
        id: 3,
        position: 3,
        i18n: { nl: { display: "Gebruikers", link: null } },
        svg: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none" /> <path d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z" /></svg>',
        submenu: [
          {
            id: 4,
            position: 1,
            i18n: { nl: { display: "App gebruikers", link: "/gebruikers" } },
            svg: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><g><path d="M0,0h24v24H0V0z" fill="none" /></g> <g> <g> <path d="M4,18v-0.65c0-0.34,0.16-0.66,0.41-0.81C6.1,15.53,8.03,15,10,15c0.03,0,0.05,0,0.08,0.01c0.1-0.7,0.3-1.37,0.59-1.98 C10.45,13.01,10.23,13,10,13c-2.42,0-4.68,0.67-6.61,1.82C2.51,15.34,2,16.32,2,17.35V20h9.26c-0.42-0.6-0.75-1.28-0.97-2H4z" /> <path d="M10,12c2.21,0,4-1.79,4-4s-1.79-4-4-4C7.79,4,6,5.79,6,8S7.79,12,10,12z M10,6c1.1,0,2,0.9,2,2s-0.9,2-2,2 c-1.1,0-2-0.9-2-2S8.9,6,10,6z" /> <path d="M20.75,16c0-0.22-0.03-0.42-0.06-0.63l1.14-1.01l-1-1.73l-1.45,0.49c-0.32-0.27-0.68-0.48-1.08-0.63L18,11h-2l-0.3,1.49 c-0.4,0.15-0.76,0.36-1.08,0.63l-1.45-0.49l-1,1.73l1.14,1.01c-0.03,0.21-0.06,0.41-0.06,0.63s0.03,0.42,0.06,0.63l-1.14,1.01 l1,1.73l1.45-0.49c0.32,0.27,0.68,0.48,1.08,0.63L16,21h2l0.3-1.49c0.4-0.15,0.76-0.36,1.08-0.63l1.45,0.49l1-1.73l-1.14-1.01 C20.72,16.42,20.75,16.22,20.75,16z M17,18c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S18.1,18,17,18z" /> </g> </g></svg>',
            pageItems: [],
          },
          {
            id: 5,
            position: 2,
            i18n: { nl: { display: "Account types", link: "/account-types" } },
            svg: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><g><rect fill="none" height="24" width="24"/></g><g><g><circle cx="17" cy="15.5" fill-rule="evenodd" r="1.12"/><path d="M17,17.5c-0.73,0-2.19,0.36-2.24,1.08c0.5,0.71,1.32,1.17,2.24,1.17 s1.74-0.46,2.24-1.17C19.19,17.86,17.73,17.5,17,17.5z" fill-rule="evenodd"/><path d="M18,11.09V6.27L10.5,3L3,6.27v4.91c0,4.54,3.2,8.79,7.5,9.82 c0.55-0.13,1.08-0.32,1.6-0.55C13.18,21.99,14.97,23,17,23c3.31,0,6-2.69,6-6C23,14.03,20.84,11.57,18,11.09z M11,17 c0,0.56,0.08,1.11,0.23,1.62c-0.24,0.11-0.48,0.22-0.73,0.3c-3.17-1-5.5-4.24-5.5-7.74v-3.6l5.5-2.4l5.5,2.4v3.51 C13.16,11.57,11,14.03,11,17z M17,21c-2.21,0-4-1.79-4-4c0-2.21,1.79-4,4-4s4,1.79,4,4C21,19.21,19.21,21,17,21z" fill-rule="evenodd"/></g></g></svg>',
            pageItems: [],
          },
        ],
        pageItems: [],
      },
    ];
  },
};
