module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.tsx',
    './public/**/*.html',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    },
  },
  plugins: [],
}
