module.exports = function (eleventyConfig) {
  eleventyConfig.addCollection("faq_de", (collection) =>
    collection.getFilteredByGlob("./site/de/faq/*.md")
  );

  eleventyConfig.addCollection("faq_en", (collection) =>
    collection.getFilteredByGlob("./site/en/faq/*.md")
  );

  // eleventyConfig.addPassthroughCopy("./site/downloads");

  return {
    dir: {
      input: "site",
    },
    dataTemplateEngine: false,
    templateFormats: ['html', 'md', 'njk'],
  };
};
