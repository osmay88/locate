/**
 * js/location-filter.js
 *
 * Ensure that relevant location updates will be sent to remote server.
 *
 * @author (AUTHOR)
 * @created (DATE)
 */

define(['config'], function (config) {

  'use strict';

  /**
   * Public API of the module.
   *
   * @type {object}
   */
  var api = {
    check: check,
    init:  init
  };

  var debug = config.debug    // Cleaner replacement for console.log()
    ;

  /**
   * Check if a consequent location is different from the previous one
   * enough to be sent to remote server.
   *
   * @param {Array<number>} location coordinate.
   * @returns {{Array<number>|null}} - coordinate to be sent or null.
   */
  function check(location) {

    return location;
  }

  /**
   * Initialize the internal state - eg. after user has been logged in.
   */
  function init() {

  }

  return api;
});
