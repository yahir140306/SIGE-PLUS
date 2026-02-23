/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#8a1937",
        secondary: "#00a651",
        accent: "#c4a006",
        header_top: "#a68b4d",
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0px",
      },
    },
  },
  plugins: [],
};
