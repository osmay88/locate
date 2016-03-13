/**
 * models/location.js
 *
 * @author Margus Lehiste <hr.lehiste@gmail.com> (initial version)
 * @author Villem Alango <villem.alango@gmail.com> (DI pattern)
 */

'use strict';

var LOCATION = 'Location'
  ;

var locationModel;


exports = module.exports = function (app) {

  var db       = app.locals.db
    , mongoose = db.mongoose
    , Schema   = mongoose.Schema
    ;

  /**
   * location
   *
   * @type {mongoose.Schema}
   */
  var locationSchema = new Schema({
      userId:  String,
      lon:     Number,
      lat:     Number,
      created: {type: Date, default: Date.now}
    }, {collection: LOCATION}
  );

  //  Add entry into mongoose dictionaries 'models' and 'modelSchemas'
  locationModel = mongoose.model(LOCATION, locationSchema);
};
