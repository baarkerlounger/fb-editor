const expect = require("chai").expect;
const jsdom = require("jsdom");
const jquery = require('jquery');
const { JSDOM } = jsdom;
const dom = new JSDOM(`<html>
    <head>
      <title>Test document</title>
    </head>
    <body>
      <h1>Testing document</h1>
    </body>
  </html>`);

// Setup globals
global.expect = expect;

// Setup environment
global.window = dom.window;
global.document = window.document;

// Setup jQuery and jQueryUI requirements
global.jQuery = require( 'jquery' )( window );
global.$ = jQuery;
require('jquery-ui/ui/widget');
require('jquery-ui/ui/unique-id');
require('jquery-ui/ui/widgets/button');
require('jquery-ui/ui/widgets/dialog');
require('jquery-ui/ui/widgets/menu');
require('jquery-ui/ui/safe-active-element');
require('jquery-ui/ui/data');
require('jquery-ui/ui/tabbable');
require('jquery-ui/ui/focusable');
require('jquery-ui/ui/safe-blur');

// Disable stuff not support by test environment
//
global.$.fn.focus = function() {
  // Do nothing because it throws an error due to environment not supporting focus.
}
