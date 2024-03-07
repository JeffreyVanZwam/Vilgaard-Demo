module.exports = {
  content: [
    "./assets/**/*.css",
    "./components/*.{vue,js}",
    "./components/**/*.{vue,js}",
    "./layouts/*.{vue,js}",
    "./pages/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./*.{vue,js,ts}",
    "./nuxt.config.{js,ts}",
    "./dist/**/*.{html,css ,js}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      boxShadow: {
        mainBlack: "0 4px 20px 0 rgb(0 0 0 / 5%)",
        mainWhite: "0 4px 20px 0 rgb(255 255 255 / 5%)",
        subtile: "0px -3px 10px rgba(0, 58, 78, 0.1)",
        "shadow-0--5-13": "0 -5px 13px #0000000D",
        "shadow-pulse": "0 0 2px 2px #28d16c",
        "white-circular": "0 0 0 10px #fff",
        "black-circular": "0 0 0 10px #000",
      },
      colors: {
        palettes: {
          theme: {
            primary: "var(--primary)", //dark color
            secondary: "var(--secondary)", //light color
            gray: "var(--gray)",
            "accent-hover": "var(--accentHover)", //slight offset from white
            accent: "var(--accent)", //slight offset from white
            white: "var(--white)",
            black: "var(--black)",
            blackForm: "var(--blackForm)",
          },
          defaultGray: {
            100: "#e4e9f0",
            200: "#cfd7e3",
            300: "#b5c0cd",
            800: "#3e4e63",
          },
          green: {
            primary: "#28C76F",
            secondary: "#95E06C",
          },
          blue: {
            primary: "#008ADA",
            secondary: "#00AEDA",
          },
          turqoise: {
            primary: "#58BDA2",
            secondary: "#69C7BE",
          },
          mos: {
            primary: "#C8E087",
            secondary: "#DDFCAD",
          },
          lime: {
            primary: "#B5C23B",
            secondary: "#D1DF4A",
          },
          yellow: {
            primary: "#FFB007",
            secondary: "#FFD820",
          },
          orange: {
            primary: "#FF5722",
            secondary: "#FF6B11",
          },
          red: {
            primary: "#F44336",
            secondary: "#F55151",
          },
          fuchsia: {
            primary: "#E91E63",
            secondary: "#F74D87",
          },
          purple: {
            primary: "#7E288D",
            secondary: "#d356e8",
          },
          lavendel: {
            primary: "#5E548E",
            secondary: "#9F86C0",
          },
          ocean: {
            primary: "#70ABAF",
            secondary: "#99E1D9",
          },
          lollipop: {
            primary: "#f56476",
            secondary: "#008dd5",
          },
          classic: {
            primary: "#5c6d70",
            secondary: "#a37774",
          },
          business: {
            primary: "#284b63",
            secondary: "#b4b8ab",
          },
          jungle: {
            primary: "#008148",
            secondary: "#c6c013",
          },
          sunset: {
            primary: "#8e24aa",
            secondary: "#ff6e40",
          },
          vilgaard: {
            primary: "#28d16c",
            secondary: "#06bc67",
          },
        },
        standards: {
          gray: {
            light: "#F6F6F6",
            mid: "#F9F9F9",
            dark: "#757575",
            midnight: "#333333",
            label: "#9e9e9e",
            // menuText: "#333453",
            menu: "F7FFF6",
            "menu-hover": "ededed",
          },
          red: {
            error: "#f44336",
          },
        },
      },
      fontFamily: {
        PublicSans: ["Public Sans", "sans-serif"],
      },
      fontSize: {
        "9px": "9px",
      },
      minHeight: (theme, { negative }) => ({
        ...theme("spacing"),
        ...negative(theme("spacing")),
      }),
      minWidth: (theme, { negative }) => ({
        ...theme("spacing"),
        ...negative(theme("spacing")),
      }),
      spacing: {
        4.5: "1.125rem",
        9.5: "2.375rem",
        13: "3.25rem",
        30: "7.5rem",
        34: "8.5rem",
        120: "30rem",
        "1/20": "5%",
        "1/10": "10%",
        "2/10": "20%",
        "3/10": "30%",
        "4/10": "40%",
        "5/10": "50%",
        "6/10": "60%",
        "7/10": "70%",
        "8/10": "80%",
        "9/10": "90%",
        "1/7": "14.29571428571429%",
        "2/7": "28.57142857142857%",
        "3/7": "42.85714285714286%",
        "4/7": "57.14285714285714%",
        "5/7": "71.42857142857143%",
        "6/7": "85.71428571428571%",
      },
      zIndex: {
        9860: "9860",
        9870: "9870",
        9880: "9880",
        9881: "9881",
        9882: "9882",
        9999: "9999",
      },
    },

    screens: {
      xs: "516px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
