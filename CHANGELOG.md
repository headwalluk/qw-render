# Changelog for @headwall/qw-render

## 1.0.10 :: 2025-03-11

* Partials can now be in nested directories, and can (optionally) include a file extension when referenced, so you can do things like {{{icons/user.svg}}} as well as {{{icons/user}}}. This was to make it east to pull in large icons sets as SVG files, while still being able to include ".html" snippets. You could also use this to include JSON files.

## 1.0.0 - 1.0.9 :: 2025-03-04

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
* Added req and res to the params when running text filters, so the filters can access things like res.locals
* Tidy up and version bump
