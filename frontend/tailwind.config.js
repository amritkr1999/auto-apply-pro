/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0984e3",
          hover: "#0873c4",
        },
        success: {
          DEFAULT: "#00b894",
          hover: "#00a383",
        },
        error: {
          DEFAULT: "#d63031",
          hover: "#b82627",
        },
        "base-text": "#2d3436",
        "bg-color": "#f1f2f6",
        surface: "#ffffff",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        btn: "8px",
        input: "4px",
        card: "8px",
        modal: "12px",
      },
    },
  },
  plugins: [],
}
