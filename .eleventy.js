module.exports = function (eleventyConfig) {
  return {
    dir: {
      input: "site",
    },
    dataTemplateEngine: false,
    templateFormats: ['html', 'md', 'njk'],
  };
};
