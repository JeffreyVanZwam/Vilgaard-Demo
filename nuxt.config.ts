// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      script: [{ src: "https://js.pusher.com/8.2.0/pusher.min.js" }],
    },
    pageTransition: { name: "page", mode: "out-in" },
  },

  build: {
    transpile: ["@vuepic/vue-datepicker"],
  },

  // https://postsrc.com/code-snippets/how-to-add-google-fonts-for-nuxt-js-project step 2
  googleFonts: {
    families: {
      "Public+Sans": [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },

  modules: [
    "@nuxtjs/google-fonts",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
    "nuxt-icon",
    "nuxt-snackbar",
  ],

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      name: "De Vilgaard | dashboard",
      short_name: "De vilgaard",
      description: "Dashboard van De Vilgaard",
      icons: [
        {
          src: "icon.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "icon.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      lang: "nl",
      background_color: "#ffffff",
      theme_color: "#ffffff",
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    // devOptions: {
    //   enabled: true,
    //   type: "module",
    // },
  },

  // https://nuxt.com/modules/snackbar
  snackbar: {
    top: true,
    duration: 5000,
    zIndex: 10000,
  },
});
