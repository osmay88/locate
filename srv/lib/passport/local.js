/**
 * lib/passport/local.js
 *
 *   Set local auth settings passport
 *
 *   @author: Osmay Y. Cruz Alvarez <osmay.cruz@gmail.com
 */

'use strict';

var LocalStrategy = require('passport-local')
  , mongoose      = require('mongoose')
  , User          = mongoose.model('User')
  ;

module.exports = new LocalStrategy(function (username, password, done) {
  User.findOne({'email': username}, function (err, user) {
    if (err) console.log(err);
    if (user) { // the username exists in the database
      if (user.checkPassword(password))
        done(null, user);
      else
        done(null, null);
    } else {
      console.log('The username ' + username + 'doesn´t exists in the db');
      done(err, null);
    }
  });
});
