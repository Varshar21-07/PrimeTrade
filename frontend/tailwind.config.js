/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f0f9ff",
        card: "rgba(255, 255, 255, 0.8)",
        primary: "#0ea5e9",
        secondary: "#10b981",
        accent: "#f59e0b",
        slate: {
          900: "#082f49",
          800: "#0c4a6e",
          400: "#7dd3fc",
          200: "#075985"
        }
      },
    },
  },
  plugins: [],
}
