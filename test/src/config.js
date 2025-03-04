/**
 * config.js
 */

module.exports = {
  server: {
    port: process.env.QW_PORT || 3000,
  },
  theme: 'theme-one', //  Set this to null to test it without a theme overlay
  minify: {
    enable: true,
    options: {
      includeAutoGeneratedTags: true,
      removeAttributeQuotes: false,
      removeComments: true,
      removeRedundantAttributes: false,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      sortClassName: true,
      useShortDoctype: true,
      collapseWhitespace: true,
    },
  },
};
