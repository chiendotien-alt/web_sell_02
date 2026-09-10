/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#ee4d2d",
          dark: "#d73211",
          light: "#fff0ed",
        },
      },
    },
  },
  plugins: [],
};
