/**
 * lib/sessions.js
 *
 * Dictionary of sessionId, sessionKey and userId tuples.
 *
 * @todo: To implement session data updates in DB
 *
 * @author Villem Alango <villem.alango@gmail.com>
 */

'use strict';

var LIMIT = 5 * 1000;

// var _ = require('underscore');

var dictI;
var dictK;
var keySeed;
var Session;
var ticker = true;  // Prevent the ticker until we have keep-alive implemented.

/*
 Dependency Injection pattern:
 we can easily control the whole context via app object.
 */

exports = module.exports = function init(app) {
  var locals = app.locals;
  Session = locals.db && locals.db.connection.model('Session') || null;
  dictI = {};
  dictK = {};
  keySeed = 0;

  //  Set up the ticker, if it has not been done already (like on testing).
  ticker || (ticker = setInterval(function () {
    var id, t = Date.now();
    for (id in dictI) {
      if (dictI[id].expire < t) {
        close_(id, 'EXPIRED');
      }
    }
  }, LIMIT));

  return exports;
};

exports.open = open;
exports.close = close;
exports.getById = getById;
exports.getByKey = getByKey;
exports.getExpired = getExpired;

/**
 * Open new session and create a sessionKey.
 *
 * @param {User} user
 * @param {function} callback
 * @param {object=} opt_data anything we want to add.
 * @returns {module} for chaining
 * @throws Error on duplicate sessionId.
 */
function open(user, callback, opt_data) {
  var key, session, t
    ;

  if (!Session) {
    throw new Error('DB has no Session model');
  }
  if ('object' === typeof opt_data) {
    opt_data = JSON.stringify(opt_data);
  }

  session = {
    userId:  user.id,
    key:     key = 'K_' + (keySeed += 1),
    aux:     opt_data || null,
    started: t = Date.now(),
    status:  'ACTIVE',
    //  The following fields are not part of Session schema.
    //  If you want to use these, notify <valango> about your plans.
    user:    user,          // Not sure yet if we are going to need this
    expire:  t + LIMIT
  };

  Session.create(session, function (err, rec) {
    if (!err) {
      dictI[session.id = rec.id] = dictK[key] = session;
    }
    callback(err, session);
  });

  return exports;
}

/**
 * Close the session.
 *
 * @param {string} sessionId
 * @returns {module} for chaining
 * @throws Error on invalid sessionId
 */
function close(sessionId) {
  if (!dictI[sessionId]) {
    throw new Error('Invalid sessionId');
  }
  close_(sessionId, 'CLOSED');
  return exports;
}

function close_(sessionId, endSatus) {
  delete dictK[dictI[sessionId].key];
  delete dictI[sessionId];
  Session.findOneAndUpdate(
    {_id: sessionId},
    {status: endSatus, ended: Date.now()},
    function (e, d) {
      // e || console.log('OK: lib/sessions#close_' + sessionId, d);
      e && console.log('FAILED: lib/sessions#close_' + sessionId, e, d);
    }
  );
}

/**
 * Get session descriptor by sessionId.
 *
 * @param {string} sessionId
 * @returns {object|null} descriptor
 */
function getById(sessionId) {
  return dictI[checkString(sessionId, 0)] || null;
}

/**
 * Get session descriptor by sessionKey.
 *
 * @param {string} sessionKey
 * @returns {object|null} descriptor
 */
function getByKey(sessionKey) {
  return dictK[checkString(sessionKey, 1)] || null;
}

/**
 * Retrieve a (possibly expired) session from Database.
 *
 * Todo: implement the real database search.
 *
 * @param {string} sessionId
 * @param {function(Error=, object)} callback
 * @returns {module} for chaining
 */
function getExpired(sessionId, callback) {
  checkString(sessionId, 0);
  setTimeout(function () {
    callback(null, null);       // Emulate "not found"
  }, 0);

  return exports;
}

/**
 * Check if the argument is a valid string Id or Key.
 *
 * @param {*} arg
 * @param {number} which
 * @returns {string}
 * @throw {TypeError}
 */
function checkString(arg, which) {
  if (!arg || 'string' !== typeof arg) {
    throw new TypeError('Illegal session' + ['Id', 'Key'][which]);
  }
  return arg;
}
