/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: {
          brand: "#4a1d8a",
          dark: "#3b1570",
          deep: "#2d1457",
          light: "#ede9f7",
          bg: "#ecddf8",
        },
      },
    },
  },
  plugins: [],
};
