/**
 * Example web app : app.js
 */

'use strict';

const express = require('express');
const config = require('./config');
const path = require('path');
const renderer = require('../../src/index.js');

const packageDef = require('../../package.json');

renderer.data.package = {
  version: packageDef.version,
  name: packageDef.name,
};

renderer.data.motd = 'Hello world';

renderer.invalidateDataKeys();

/**
 * Set the main content directory....
 */
renderer.setContentDir(path.join(path.dirname(__dirname), 'content'));

/**
 * ...then add a theme overlay, which is just like content directory but with
 * file overrides.
 */
if (config.theme) {
  renderer.applyThemeOverlay(path.join(path.dirname(__dirname), config.theme));
}

renderer.addFilter('outputHtml', null, (content, params) => {
  if (params.contentType == 'text/html') {
    console.log(`Adding qwRenderTest state to the output ${params.fileName}`);
    const state = {
      config,
      dateTime: new Date(),
    };

    return content.replace('<head>', `<head><script>const qwRenderTest = ${JSON.stringify(state)}</script>`);
  }

  return content;
});

const app = express();
app.disable('x-powered-by');

app.get(/.*/, (req, res) => {
  const url = URL.parse(`${req.protocol}://${req.hostname}:${config.server.port}${req.originalUrl}`);
  renderer.sendFile(req, res, url.pathname);
});

app.listen(config.server.port, () => {
  console.log(`QW Render Test listening on port ${config.server.port}`);
});
