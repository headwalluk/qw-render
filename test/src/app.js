/**
 * Example web app : app.js
 */

const express = require('express');
const config = require('./config');
const path = require('path');
const renderer = require('../../src/index.js');
const htmlMinify = require('html-minifier');

renderer.setContentDir(path.join(path.dirname(__dirname), 'content'));

if (config.theme) {
  renderer.applyThemeOverlay(path.join(path.dirname(__dirname), config.theme));
}

renderer.addFilter('renderedHtml', renderer.LAST_FILTER, (content, params) => {
  if (params.isTextContent && config.minify.enable) {
    console.log(`Minifying ${params.fileName}`);
    return htmlMinify.minify(content, config.minify.options);
  }

  return content;
});

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

// renderer.addFilter('outputHtml', null, (content, params) => {
//   console.log(`Filtering output of params.fileName`);
//   return content;
// });

const app = express();
app.disable('x-powered-by');

// app.get(/\/$/, (req, res) => {
//   const url = URL.parse(`${req.protocol}://${req.hostname}:${config.server.port}${req.originalUrl}`);
//   console.log(`MATCH: ${url.pathname}`);
//   renderer.sendFile(req, res, url.pathname);
// });

app.get([], (req, res) => {
  // res.send('Hello World!');
  // const url = URL.parse(req.url);

  // const protocol = req.protocol;
  // const host = req.hostname;
  // const url = req.originalUrl;
  // const port = port; //config. process.env.PORT || PORT;

  // const fullUrl = `${protocol}://${host}:${port}${url}`;
  const url = URL.parse(`${req.protocol}://${req.hostname}:${config.server.port}${req.originalUrl}`);
  // console.log(url);

  renderer.sendFile(req, res, url.pathname);
});

app.listen(config.server.port, () => {
  console.log(`QW Render Test listening on port ${config.server.port}`);
});
