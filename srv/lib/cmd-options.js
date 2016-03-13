/**
 * lib/cmd-options.js
 *
 * Command line options parser.
 *
 * todo: implement clean exit in case of the help is needed.
 *
 * @author Villem Alango <villem.alango@gmail.com>
 * @created 13.08.15 20:52
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

var optimist = require('optimist')
  ;

var isHelpNeeded = function () {
  return !(optimist.argv.help || optimist.argv._.indexOf('help') >= 0);
};

/**
 * Parse the command line and take action if needed.
 *
 * @param {object} defaults
 * @returns {object}
 */
var run = function (defaults) {
  return optimist
    .default(defaults || {})
    .check(isHelpNeeded.bind(null))  // A trick to hide program code
    .usage('Web server script')
    .argv;
};

/**
 * Module exports.
 * @public
 */
module.exports = run;
