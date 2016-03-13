/* global logger */
/**
 * This file is to test a new idea in the session managment model
 * @author Osmay Y. Cruz Alvarez <osmay.cruz@gmail.com>
 */

'use strict';

var Session;

var session_timeout = 5*60*1000; // maximum inactivity time for a session in ms


exports = module.exports = function init(app) {
  var locals = app.locals;
  Session = locals.db && locals.db.connection.model('Session') || null;
  return exports;
};

exports.open = open;
exports.close = close;
exports.getById = getById;
exports.getByKey = getByKey;
exports.getByUserId = getByUserId;
exports.validate = validate;

/**
 * Open new session and create a sessionKey.
 *
 * @param {User} user
 * @param {function} callback
 * @param {object=} opt_data anything we want to add.
 * @returns {module} for chaining
 * @throws Error on duplicate sessionId.
 */
function open(user, callback) {
    
  if (!Session) {
    throw new Error('DB has no Session model');
  }
  
  var session = new Session({
    userId:  user.id,
    created:  Date.now(),
    lastactive: Date.now()
  });
  
  session.save(function(err, data){
    callback(err, data);
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
  close_(sessionId);
  return exports;
}

function close_(sessionId) {
  Session.findOne({'id': sessionId}, function(err, session){
    if(err) logger(err);
    session.remove().exec(); //TODO: this still unstable be careful 
  });
}

/**
 * Get session descriptor by sessionId.
 *
 * @param {string} sessionId
 * @returns {object|null} descriptor
 */
function getById(sessionId, callback) {
  return Session.findById(sessionId, function(err, data){
    callback(err, data);
  });
}

/**
 * Get session descriptor by sessionKey.
 *
 * @param {string} sessionKey
 * @returns {object|null} descriptor
 */
function getByKey(sessionKey, callback) {
  return Session.findByKey(sessionKey, function(err, data){
    callback(err, data);
  });
}

function getByUserId(userId, callback){
  Session.findByUserId(userId, function(err, data){
    callback(err, data);
  });
}

/**
 * This function shall be called everytime the user 
 * make a request to the server
 * @returns Object{valid, reason}
 */
function validate(sessionId, sessionKey){
  var session = {};
  session.valid = false;
  session.reason = "Umnoun";
  Session.findByKey(sessionKey, function(err, data){
    if(err) logger(err)
    if(data){ // the session exist in my database
      if(data.key === sessionKey){
        //here i test some other options blah blah blah
        //checking for inactivity time
        var lapse = Date.now() - data.lastactive;  // in ms
        if(lapse >= session_timeout){
          close_(sessionId);
          session.valid = false;
          session.reason = "Session timeout";
        }else{
          //here i update the session lastactive data and save it
          data.lastactive = Date.now();
          data.save();
          session.valid = true;
        }
      }else{
        session.valid = false;
        session.reason = "Session key doesn´t match";
      }  
    }else{
      session.valid = false;
      session.reason = "Session doesn´t exists";
    }
  });
  return session;
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
