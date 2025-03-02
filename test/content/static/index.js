/**
 * /index.js
 */

(function () {
  'use strict';

  if (typeof qwRenderTest === 'undefined') {
    console.error(`global "qwRenderTest" is not defined`);
  } else {
    console.log('/index.js : init');

    const configElement = document.querySelector('#config');
    if (configElement) {
      configElement.innerText = JSON.stringify(qwRenderTest.config, null, 4);
    }
  }
})();
