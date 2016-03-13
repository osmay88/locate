/**
 * This model save the session to db
 *
 * @author: Osmay Y. Cruz Alvarez <osmay.cruz@gmail.com> (initial code)
 * @author Villem Alango <villem.alango@gmail.com> (using with lib/sessions.js)
 */

'use strict';

var SESSION = 'Session';

var crypto = require('crypto');

exports = module.exports = function (app) {
  var db       = app.locals.db
    , mongoose = db.mongoose
    ;

  var schema = new mongoose.Schema({
    key:     String,
    aux:     String,
    created: {type: Date, default: Date.now},
    lastactive: {type:Date, default: Date.now}, 
    userId:  String
  }, {collection: SESSION});
  
  schema.pre('save', function(next){
    if(!this.key){
      this.key = crypto.createHash('sha256').update(this.created + this.userId).digest('hex');
    }
    next();
  });

  schema.statics.findById = function (sessionId, callback) {
    return this.findOne({'id': sessionId}, callback);
  };
  
  schema.statics.findByUserId = function(userId, callback) {
    return this.findOne({'userId': userId}, callback);
  };
  
  schema.statics.findByKey = function(sessionKey, callback){
    return this.findOne({'key': sessionKey}, callback);    
  };
  
  mongoose.model(SESSION, schema);
};
