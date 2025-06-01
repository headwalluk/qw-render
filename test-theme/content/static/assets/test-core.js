/**
 * test-core.js
 */

'use strict';

(function () {
  if (typeof qwRenderTest === 'undefined') {
    console.error(`global "qwRenderTest" is not defined`);
  } else {
    console.log('/test-core.js : init');
    console.log(`qwRenderTest`);
    console.log(qwRenderTest);
  }
})();
