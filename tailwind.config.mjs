/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#00a651",
        secondary: "#00a651",
        accent: "#c4a006",
        header_top: "#a68b4d",
        maroon: "#8b1d3d",
        "background-light": "#f8f9fa",
        "background-dark": "#1a1a1a",
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif", "Public Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
