# Changelog for @headwall/qw-render

## 1.0.0 - 1.0.7 :: 2025-03-04

* Initial commit
* Basic renderer
* Basic test suite (npm run test)
* Implemented sendFile()
* Implemented output caching
* Moved htmlOutputFilter out of the config section
* Added HTML filters (cachable and final output stage)
* Added theme overlay capability for static content and partials
* Caching for text and binary content can be enabled independently
* Replaced the basic test suite with a text/example web app using nodemon
  * Test theme overlay
  * Test output filters by adding minification of HTML, CSS and JS
* Moved minification out of the test app and into the main qw-render library.
