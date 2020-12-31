/** @type {import("snowpack").SnowpackUserConfig} */
module.exports = {
  mount: {
    public: { url: '/', static: false },
    src: { url: '/dist' },
  },
  plugins: [
    "@snowpack/plugin-postcss", "@snowpack/plugin-webpack"
  ],
  install: [
    /* ... */
  ],
  installOptions: {
    installTypes: true
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
  proxy: {
    /* ... */
  },
  alias: {
    /* ... */
  },
};
