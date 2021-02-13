/** @type {import("snowpack").SnowpackUserConfig} */
module.exports = {
  mount: {
    "_site/de": { url: "/de" },
    "_site/en": { url: "/en" },
    "site/downloads": "/downloads",
    src: { url: "/dist" },
  },
  plugins: [
    "@snowpack/plugin-postcss",
    [
      "@snowpack/plugin-run-script",
      {
        cmd: "eleventy",
        watch: "$1 --watch --quiet",
      },
    ],
  ],
  devOptions: {
    open: "none",
    // Eleventy updates multiple files at once, so add a 1000ms delay before we trigger a browser update
    hmrDelay: 1000,
  },
  optimize: {
    bundle: true,
    minify: true,
    target: "es2017",
  },
};
