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
          dark: "#c23f20",
          light: "#fff0ed",
        },
        ink: {
          DEFAULT: "#1f2430",
          muted: "#6b7280",
          soft: "#9aa0ac",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f5f6f8",
        },
        accent: {
          teal: "#0ea55a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
