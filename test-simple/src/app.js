/**
 * Example web app : app.js
 */

'use strict';

const express = require('express');
const config = require('./config');
const path = require('path');
const renderer = require('../../src/index.js');

/**
 * Enable output minification based on our config.
 */
renderer.setMinifyOptions(config.minify.isEnabled, config.minify.options);

/**
 * Attach some data to the renderer that we can access by name in
 * curly-brace tags.
 */

// Access in templates with {{package.name}} & {{package.version}}
const packageDef = require('../../package.json');
renderer.data.package = {
  version: packageDef.version,
  name: packageDef.name,
};

// Access in templates with {{motd}}
renderer.data.motd = 'Hello world';

/**
 * It's good practice to invalidate the data keys after adding/removing
 * a key to the data store. You don't need to invalidate if you're just
 * changing a value.
 */
renderer.invalidateDataKeys();

/**
 * The content directory will usually contain two subdirectories:
 * static/
 * partials/
 */
renderer.setContentDir(path.join(path.dirname(__dirname), 'content'));

/**
 * Filter the output HTML, even if it's come from the cache. Useful for
 * injecting state.
 */
renderer.addFilter('outputHtml', null, (content, params) => {
  if (params.contentType == 'text/html') {
    // console.log(`Adding qwRenderTest state to the output ${params.fileName}`);
    const state = {
      config,
      dateTime: new Date(),
    };

    return content.replace('<head>', `<head><script>const qwRenderTest = ${JSON.stringify(state)};</script>`);
  }

  return content;
});

/**
 * Set up Express.
 */
const app = express();
app.disable('x-powered-by');

/**
 * The default route for content (CSS, JS, HTML and images).
 */
app.get(/.*/, (req, res) => {
  const url = URL.parse(`${req.protocol}://${req.hostname}:${config.server.port}${req.originalUrl}`);
  renderer.sendFile(req, res, url.pathname);
});

/**
 * Start Express.
 */
app.listen(config.server.port, () => {
  console.log(`QW Render Test listening on port ${config.server.port}`);
});
