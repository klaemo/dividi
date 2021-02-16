const { nanoid } = require("nanoid");

module.exports = {
  environment: process.env.NODE_ENV,
  build_id:
    process.env.NODE_ENV === "production" ? nanoid(8).toLowerCase() : undefined,
};
