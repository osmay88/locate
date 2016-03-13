/**
 * models/user.js
 *
 * @author Osmay Cruz Alvarez <osmay.cruz@gmail.com> (initial version)
 * @author Villem Alango <villem.alango@gmail.com> (DI pattern)
 */

'use strict';

var USER = 'User'
  ;

var crypto = require('crypto')
  ;

var userModel;

/*
 Dependency Injection pattern:
 we can easily control the whole context via app object.
 */

exports = module.exports = function (app) {

  var db       = app.locals.db
    , mongoose = db.mongoose
    , Schema   = mongoose.Schema
    ;

  /**
   * User
   *
   * @type {mongoose.Schema}
   */
  var userSchema = new Schema({
      email:            String,
      password:         String,
      firstName:        String,
      lastName:         String,
      phone:            String,
      identities:       [{
        provider:     String, // 'google', 'twitter', etc...
        identity: String
      }],
      profile:    {
        country:   String,
        gender:    String,
        birthDate: Date
      },
      created:    {type: Date, default: Date.now},
      salt:       String
    }, {collection: USER}
  );

  /**
   * Validate the submitted password.
   *
   * @param password
   * @returns {boolean}
   */
  userSchema.methods.checkPassword = function (password) {
    var hash = crypto.createHash('sha256').update(this.salt + password).digest('hex');
    return this.password === hash;
  };

  /**
   * Set new password, with salt.
   *
   * @param password
   */
  userSchema.methods.setPassword = function (password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var hash = crypto.createHash('sha256').update(salt + password).digest('hex');
    this.salt = salt;
    this.password = hash;
  };

  /**
   * If password is just plain (like when importing from JSON), make it right.
   */
  userSchema.pre('save', function (next) {
    if (!this.salt && this.password) {
      this.setPassword(this.password);
    }
    next();
  });

  userSchema.statics.findByEmail = function (email, cb) {
    return this.findOne({'email': email}, cb);
  };

  //  Add entry into mongoose dictionaries 'models' and 'modelSchemas'
  userModel = mongoose.model(USER, userSchema);
};
