module.exports = {
  darkMode: process.env.NODE_ENV !== "production" ? "class" : "media",
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
