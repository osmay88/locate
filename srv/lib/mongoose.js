/**
 * lib/mongoose.js
 *
 * Set up the database connection via Mongoose.
 * This module encapsulates the actual database specifics,
 * so using the Dependency Injection design pattern for other modules
 * will be easy - a priceless advantage when it comes to module testing.
 *
 * @author Villem Alango <villem.alango@gmail.com>
 * @created 13.08.15 23:02
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

var mongoose = require('mongoose')
  ;

/**
 * Open the connection and set up error handling.
 *
 * @link(http://mongoosejs.com/docs/connections.html)
 *
 * @param {string} uri
 * @param {function=} callback
 * @param {object=} options
 * @returns {mongoose}
 */
var connect = function (uri, callback, options) {

  var connection
    , subOptions
    , socketOptions = {keepAlive: 1}
    ;

  if ('function' !== typeof callback) {
    options = callback;
    callback = undefined;
  }

  options = options || {};

  subOptions = options.server || {};
  if (undefined === subOptions.socketOptions) {
    subOptions.socketOptions = socketOptions;
  }
  options.server = subOptions;

  subOptions = options.replset || {};
  if (undefined === subOptions.socketOptions) {
    subOptions.socketOptions = socketOptions;
  }
  options.replset = subOptions;

  connection = mongoose.connection;

  if (callback !== undefined) {
    connection.on('error', function (e) {
      callback(e, connection, mongoose);
    });
    connection.once('open', function () {
      callback(null, connection, mongoose);
    });
  } else {
    connection.on('error', console.error.bind(console, 'DB connection error:'));
  }
  mongoose.connect(uri, options);

  return mongoose;
};


/**
 * Module exports.
 * @public
 */
exports = module.exports = connect;
exports.mongoose = mongoose;
exports.connection = mongoose.connection;
