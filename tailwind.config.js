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
          DEFAULT: "#a5682f",
          dark: "#7a4a1e",
          light: "#f6ede0",
        },
        ink: {
          DEFAULT: "#2b241d",
          muted: "#6b5d4f",
          soft: "#a69684",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f7f2ea",
        },
        accent: {
          teal: "#6b7a4f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
