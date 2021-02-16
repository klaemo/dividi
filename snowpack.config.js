const languages = require('./site/_data/i18n.json')

const routes = languages.enabled_languages.reduce((obj, lang) => {
  obj[`_site/${lang.code}`] = { url: `/${lang.code}` }
  return obj
}, {})

/** @type {import("snowpack").SnowpackUserConfig} */
module.exports = {
  mount: {
    ...routes,
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
