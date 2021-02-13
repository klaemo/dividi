module.exports = {
  purge: [
    "./src/**/*.tsx",
    "./src/**/*.ts",
    "./site/**/*.html",
    "./site/**/*.njk",
    "./site/**/*.md",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ["disabled"],
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
