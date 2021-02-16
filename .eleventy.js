module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksFilter("order", function(list, order = 'asc') {
    return list.sort((a, b) => {
      if (order === 'asc') {
        return a.data.order - b.data.order
      }

      if (order === 'desc') {
        return b.data.order - a.data.order
      }

      return 0
    })
  })

  return {
    dir: {
      input: "site",
    },
    dataTemplateEngine: false,
    templateFormats: ['html', 'md', 'njk'],
  };
};
