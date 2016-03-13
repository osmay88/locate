/**
 * models/index.js
 *
 * Load and register all data models necessary fot the App.
 *
 * todo: implement the initialisation from JSON file.
 *
 * @author Villem Alango <villem.alango@gmail.com>
 * @created 14.08.15 9:36
 */

'use strict';

/*
 Dependency Injection pattern:
 we can easily control the whole context via app object.
 */

exports = module.exports = function (app) {

  // Register and bind all the model files in uniform way...
  require('./user.js')(app);
  require('./friendlist')(app);
  require('./location.js')(app);
  require('./session.js')(app);  // Register the session model
  require('./serverlog.js')(app);
};
