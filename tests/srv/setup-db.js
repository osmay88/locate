/**
 * tests/srv/setup-db.js
 *
 * Set up test database and initialize it.
 *
 * @author Villem Alango <villem.alango@gmail.com>
 * @created 24.08.15 21:02
 */

'use strict';

var dbDriver = require('../../srv/lib/mongoose')
  , dbInit   = require('../../srv/lib/db-init')
  ;

/**
 * Set up the simplico_test database and initialize it.
 *
 * @param {object|string} initData - itself or path to file containing it.
 * @param app {object} - for DI.
 * @param callback {function(err,data)=} - mongoose style.
 * @returns {mongoose}
 * @throws Error from mongoose when callback was not supplied.
 */
module.exports = function init(app, initData, callback) {

  if ('function' === typeof initData) {
    (callback = initData) && (initData = null);
  }
  if ('string' === typeof initData) {
    initData = require(initData);
  }
  if (initData && 'object' !== typeof initData) {
    throw new TypeError('initData should be an object or file path');
  }

  return dbDriver('mongodb://localhost/simplico_test',
    function (err, connection, mongoose) {
      if (err) {
        if (callback) {
          return callback(err);
        }
        console.error(err);
        process.exit(1);
      }
      app.locals.db = {connection: connection, mongoose: mongoose};
      require('../../srv/models')(app);

      initData ? dbInit(app, initData, callback) : callback && callback();
    });
};
