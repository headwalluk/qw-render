/**
 * test.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const renderer = require('../src/index');

const tagMatcher = /\{\{\{[^\}]+\}\}\}/g;

const baseDir = __dirname;
renderer.config.htmlDocsDir = path.join(baseDir, 'static');
// renderer.config.htmlPartialsDir = path.join(baseDir, 'partials');

renderer.loadPartials(path.join(baseDir, 'partials'));
console.log();
console.log(`Partials`);
console.log();
for (const slug in renderer.partials) {
  console.log(`\ue736 : ${slug} => ${renderer.partials[slug].fileName}`);
}
// console.log(renderer.config);

console.log();
console.log(`HTML manual load & parse`);
console.log();

const htmlDocFileNames = fs.readdirSync(renderer.config.htmlDocsDir);
htmlDocFileNames.forEach((htmlDocFileName) => {
  console.log();
  console.log(`\ue736 ${htmlDocFileName}`);
  const fullPath = path.join(renderer.config.htmlDocsDir, htmlDocFileName);
  const rawHtml = fs.readFileSync(fullPath).toString();
  // console.log(rawHtml);
  const matchesBefore = rawHtml.match(tagMatcher) || [];
  const renderedHtml = renderer.render(rawHtml);
  const matchesAfter = renderedHtml.match(tagMatcher) || [];

  // console.log(`Tags in the source HTML: ${matchesBefore.length}`);
  // console.log(`Tags in the rendered HTML: ${matchesAfter.length}`);

  let message = null;
  let isPassed = false;
  if (matchesBefore.length <= 0) {
    message = 'No tags detected in the source HTML';
  } else if (matchesAfter.length > 0) {
    message = `Tags detected in the source HTML: ${matchesAfter.length}`;
  } else {
    message = 'Passed OK';
    isPassed = true;
  }

  console.log(`${isPassed ? '✅' : '❗'} ${message}`);

  // console.log(matches);
});
