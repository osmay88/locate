/**
 * lib/db-init.js
 *
 * Initalize the database.
 *
 * todo: implement the initialisation from JSON file.
 *
 * @author Villem Alango <villem.alango@gmail.com>
 * @created 14.08.15 11:35
 */

'use strict';

var connection
  , locals
  , mongoose
  ;

/*
 Dependency Injection pattern:
 we can easily control the whole context via app object.
 */

/**
 * Empty the connected database and initialize it with the data.
 *
 * @param {object} app
 * @param {Array<object>} data for initialization
 * @param {function(error,...)=} callback
 */
exports = module.exports = function (app, data, callback) {

  locals = app.locals;
  mongoose = locals.db.mongoose;
  connection = locals.db.connection;
  init(data, callback);
};

/**
 * Initiate the database with predefined data (not final yet!)
 */
function init(data, callback) {

  connection.db.dropDatabase(function (err /*, res*/) {

    if (!err) {
      return importData(data, callback);
    }
    console.error(err);
    process.exit(1);
  });
}

/**
 * Write objects from the data array into the database.
 *
 * Values with syntax $<entityName>.<fieldName> will be replaced by
 * appropriate values from the most recently saved entity record.
 * NB: Only top-level values are available this way!
 *
 * @param {Array<object>} dataArray
 * @param {function(error,...)=} callback
 */
function importData(dataArray, callback) {

  var dataIndex = 0
    , lastSaved = {}
    ;

  //  Due to asynchronous nature of DB operations we can not just iterate
  // through the array here - when processing the new record we might need
  // the results from save() operation of the previous one
  // for value replacement.
  var processData = function () {

    var data, doc, entity, field, item, Model, prev, r, tree, v
      , rx = /^\$(\w+)\.(\w+)$/;

    var next = function () {
      setTimeout(processData, 0);
    };

    /* jshint singleGroups: false */
    if ('undefined' === typeof (item = dataArray[dataIndex])) {
      callback && callback();
      return;
    }
    dataIndex += 1;
    (entity = item.entity) && (data = item.data);
    if (!(Model = mongoose.models[entity])) {
      locals.warner('Unknonwn entity "' + entity + '" will be ignored!');
      return next();
    }
    tree = Model.schema.tree;

    //  Check if the data matches the schema
    for (field in data) {

      if (data.hasOwnProperty(field)) {

        if ('string' === typeof(v = data[field]) && (r = rx.exec(v))) {

          if ('undefined' === typeof(prev = lastSaved[r[1]])) {
            prev = 'lib/db-init.js:97: item "' + r[1] + '" is not saved yet!';
            if (callback) {
              return callback(new Error(prev));
            }
            console.error(prev);
            process.exit(1);
          }
          data[field] = v = prev[r[2]];
        }
        if (!tree.hasOwnProperty(field)) {
          locals.warner('lib/db-init.js:103: item "' + entity + '" has no field "' +
            field + '", - the value "' + v + '" will be ignored.');
        }
      }
    }

    //  Save the record. Because this operation is asynchronous,
    // we need a dynamic closure to remember the entity name here.
    doc = new Model(data);
    (function (entityName) {
      doc.save(function (err, rec) {
        var prefix = ['Mongo', entityName, 'save'].join('::');
        if (err) {
          if (callback) {
            return callback(err, prefix);
          }
          console.error(prefix, err);
          process.exit(1);
        }
        lastSaved[entityName] = rec;  // Remember the final values
        next();
      });
    }(entity));
  };
  processData();
}
