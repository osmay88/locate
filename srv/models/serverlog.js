/**
 * This model save the server logs to the db
 *
 * @author: Osmay Y. Cruz Alvarez <osmay.cruz@gmail.com>
 */

'use strict';

var LOG = 'Logs';

exports = module.exports = function (app) {
  var db       = app.locals.db
    , mongoose = db.mongoose
    ;

  var schema = new mongoose.Schema({
    created:     Number,
    kind:     String,  // Ej. ERROR, WARNING, LOG
	reason: String,    //Describe the log reason Ej. Session deleted
  }, {collection: LOG});

  schema.statics.findByReason = function (reason, callback) {
    return this.findOne({'reason': reason}, callback);
  };

  mongoose.model(LOG, schema);
};