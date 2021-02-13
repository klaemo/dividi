const { nanoid } = require("nanoid");

module.exports = {
  enabled_languages: [
    { code: "de", icon: "🇩🇪" },
    { code: "en", icon: "🇬🇧" },
  ],
  environment: process.env.NODE_ENV,
  build_id:
    process.env.NODE_ENV === "production" ? nanoid(8).toLowerCase() : undefined,
};
