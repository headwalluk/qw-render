/**
 * index.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const self = {
  DEFAULT_FILTER_PRIORITY: 10,
  LAST_FILTER: 999,

  config: {
    staticContentDirs: [],
    htmlPartialsDirs: [],
    partialsFileMatch: /^[a-zA-Z0-9\-].*\.(s|p)?html$/,
    defaultIndex: 'index.html',
    maxRecursion: 50,
    cache: {
      enabledForText: true,
      enabledForBinaries: true,
    },
    isAutoAssetInjectionEnabled: true,
  },

  filterNames: [
    'renderedHtml', //  This can be put into the cache - never add dynamic content with this filter
    'outputHtml', // Sent to the browser - can include dyanmic content
  ],

  filters: {},
  partials: {},
  fileCache: {},
  htmlOutputFilters: {},

  isInitialised: false,
  init: () => {
    if (self.isInitialised) {
      throw Error(`qw-render : already initialised`);
    }

    console.log(`qw-render : initialise`);

    self.addFilter('renderedHtml', 5, self.autoInjectPageAssets);

    self.isInitialised = true;
  },

  loadPartials: (dirName) => {
    self.flushPartials();
    self.config.htmlPartialsDirs.forEach((dirName) => {
      console.log(`Loading partials from ${dirName}`);

      const fileNames = fs.readdirSync(dirName);
      if (!Array.isArray(fileNames)) {
        throw Error(`loadPartials: Failed to read dir ${dirName}`);
      }

      fileNames.forEach((fileName) => {
        if (fileName.match(self.config.partialsFileMatch)) {
          const fullPath = path.join(dirName, fileName);
          const slug = path.parse(fileName).name;

          console.log(`Load partial: ${fileName} fullPath=${fullPath} slug=${slug}`);

          self.partials[slug] = {
            fileName,
            fullPath,
            slug,
            snippet: fs.readFileSync(fullPath).toString(),
          };
        }
      });
    });
  },

  isOutputCacheEnabled: () => {
    return self.config.cache.enabledForText || self.config.cache.enabledForBinaries;
  },

  setContentDir: (baseDir) => {
    while (self.config.staticContentDirs.length > 0) {
      self.config.staticContentDirs.pop();
    }

    while (self.config.htmlPartialsDirs.length > 0) {
      self.config.htmlPartialsDirs.pop();
    }

    self.addStaticContentDir(path.join(baseDir, 'static'));
    self.addHtmlPartialsDir(path.join(baseDir, 'partials'));
  },

  applyThemeOverlay: (themeDir) => {
    self.addStaticContentDir(path.join(themeDir, 'static'));
    self.addHtmlPartialsDir(path.join(themeDir, 'partials'));
  },

  addStaticContentDir: (fullPath) => {
    if (!fullPath) {
      console.error('addStaticContentDir: fullPath cannot be empty');
    }

    if (self.config.staticContentDirs.includes(fullPath)) {
      self.config.staticContentDirs.remove(fullPath);
    }

    if (!fs.existsSync(fullPath)) {
      console.log(`addStaticContentDir: ${fullPath} not found - skipping`);
    } else {
      self.config.staticContentDirs.push(fullPath);
    }

    self.flushFileCache();
  },

  addHtmlPartialsDir: (fullPath) => {
    if (!fullPath) {
      console.error('addStaticContentDir: fullPath cannot be empty');
    }

    if (self.config.htmlPartialsDirs.includes(fullPath)) {
      self.config.htmlPartialsDirs.remove(fullPath);
    }

    self.config.htmlPartialsDirs.push(fullPath);
    self.flushPartials();
    self.flushFileCache();
  },

  addFilter: (filterName, priority, callback) => {
    if (!self.filterNames.includes(filterName)) {
      throw Error(`Invalid filter name: ${filterName}`);
    }

    if (isNaN((priority = parseInt(priority)))) {
      priority = self.DEFAULT_FILTER_PRIORITY;
    }

    priority = Math.min(Math.max(parseInt(priority), 0), 999);

    if (!self.filters[filterName]) {
      self.filters[filterName] = {};
    }

    const filterIndex = Object.keys(self.filters[filterName]).length;
    const slug = String(priority).padStart('3', '0') + `-${filterName}-${String(filterIndex).padStart(3, '0')}`;

    self.filters[filterName][slug] = callback;

    // console.log(`Added filter: ${slug}`);
  },

  applyFilters: (filterName, content, params) => {
    if (!self.filters[filterName]) {
      // No filters defined
      // console.log(`No "${filterName}" filters specified`);
    } else {
      // console.log(`Applying "${filterName}" filters`);
      const slugs = Object.keys(self.filters[filterName]);
      slugs.sort();
      slugs.forEach((slug) => {
        content = self.filters[filterName][slug](content, params);
      });
    }

    return content;
  },

  render: (rawHtml) => {
    let html = rawHtml.toString();

    if (Object.keys(self.partials).length <= 0) {
      self.loadPartials();
    }

    let isChanged = true;
    let iteration = 0;
    while (isChanged && iteration < self.config.maxRecursion) {
      isChanged = false;
      for (const slug in self.partials) {
        const tag = `{{{${slug}}}}`;
        const newHtml = html.replaceAll(tag, self.partials[slug].snippet);
        isChanged |= newHtml != html;
        html = newHtml;
      }

      ++iteration;
    }

    return html;
  },

  findStaticFile: (fileName) => {
    if (!self.config.staticContentDirs.length) {
      throw Error(`findStaticFile: No static content directories set`);
    }

    let foundFullPath = null;

    for (let index = self.config.staticContentDirs.length - 1; index >= 0; --index) {
      const testFullPath = path.join(self.config.staticContentDirs[index], fileName);
      // console.log(`Looking for static file ${testFullPath}`);
      if (fs.existsSync(testFullPath)) {
        foundFullPath = testFullPath;
        break;
      }
    }

    return foundFullPath;
  },

  flushFileCache: () => {
    Object.keys(self.fileCache).forEach((key) => delete self.fileCache[key]);
  },

  flushPartials: () => {
    Object.keys(self.partials).forEach((key) => delete self.partials[key]);
  },

  autoInjectPageAssets: (content, params) => {
    let contentType = mime.lookup(params.fileName);

    if (!self.config.isAutoAssetInjectionEnabled) {
      // ...
    } else if (contentType != 'text/html') {
      // ...
    } else {
      let additionalHtml = '';

      const filePath = path.dirname(params.fileName);
      const fileName = path.basename(params.fileName);
      const baseName = path.parse(params.fileName).name;

      console.log(`Looking for page assets ${baseName} dir=${filePath}`);

      const jsFileName = path.join(filePath, `${baseName}.js`);
      const jsFullPath = self.findStaticFile(jsFileName);

      // console.log(`TEST: ${jsFileName} => ${jsFullPath}`);
      if (jsFullPath) {
        additionalHtml += `<script src="${jsFileName}" defer></script>`;
      }

      const cssFileName = path.join(filePath, `${baseName}.css`);
      const cssFullPath = self.findStaticFile(cssFileName);
      // console.log(`TEST: ${cssFileName} => ${cssFullPath}`);
      if (cssFullPath) {
        additionalHtml += `<link href="${cssFileName}" rel="stylesheet" />`;
      }

      if (additionalHtml) {
        content = content.replace('</head>', `${additionalHtml}</head>`);
      }
    }

    return content;
  },

  sendFile: (req, res, fileName) => {
    if (!fileName || (fileName.endsWith('/') && self.config.defaultIndex)) {
      fileName = `${fileName}${self.config.defaultIndex}`;
    }

    const fullPath = self.findStaticFile(fileName);
    let contentType = mime.lookup(fileName);
    let contentBody = null;
    const isText = contentType && contentType.startsWith('text/');
    const isHtml = contentType == 'text/html';

    const filterParams = {
      fileName,
      fullPath,
      contentType,
      isTextContent: isText,
    };

    if (self.fileCache && self.fileCache[fullPath]) {
      // console.log(`Cache hit: ${fullPath}`);
      contentBody = self.fileCache[fullPath];
    } else if (!fullPath || !fs.existsSync(fullPath)) {
      // 404
    } else if (!isText) {
      // console.log(`Cache miss (binary): ${fullPath}`);
      contentBody = fs.readFileSync(fullPath);

      if (contentBody && self.config.cache.enabledForBinaries) {
        self.fileCache[fullPath] = contentBody;
      }
    } else {
      // console.log(`Cache miss (text): ${fullPath}`);
      const rawHtml = fs.readFileSync(fullPath).toString();

      if (rawHtml) {
        contentBody = self.render(rawHtml);
        // if (contentType == 'text/html') {
        if (isText) {
          contentBody = self.applyFilters('renderedHtml', contentBody, filterParams);
        }
      }

      if (contentBody && self.config.cache.enabledForText) {
        self.fileCache[fullPath] = contentBody;
      }
    }

    if (!contentBody) {
      res.status(404).send({ message: 'NOT FOUND', fileName: fileName });
    } else {
      contentType && res.set('Content-Type', contentType);

      if (isText) {
        contentBody = self.applyFilters('outputHtml', contentBody, filterParams);
      }

      res.setHeader('Content-Length', `${contentBody.length}`);
      res.status(200).send(contentBody);
    }
  },
};

self.init();

module.exports = self;
