/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "accent-teal": "#22d3ee",
        "light-foreground": "#e5e7eb"
      }
    }
  },
  plugins: []
};