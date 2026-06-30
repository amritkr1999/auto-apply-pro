/** @type {import('tailwindcss').Config} */
module.exports = {
  // Specify paths to all component files so Tailwind can scan them for classes
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        darkBg: '#0f172a',
      }
    },
  },
  plugins: [],
};
