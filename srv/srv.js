/**
 * srv.js
 *
 * Web server main module. It does nothing clever - it just orchestrates
 * the server-side housekeeping, while most of the server functionality
 * is implemented in 'lib/' modules.
 *
 * @author Villem Alango <villem.alango@gmail.com>
 */

'use strict';

/** @const {number}  */
var PORT = 1111;
/** @const {string}  */
var DB_URI = 'mongodb://localhost:27017/simplico';

/**
 * Module dependencies.
 * @private
 */

var express    = require('express')
  , path       = require('path')
  , http       = require('http')
  , compressor = require('compression')
  , sockets    = require('socket.io')
  , db_driver  = require('./lib/mongoose')
  , slots      = require('./lib/slots')
  , options    = require('./lib/cmd-options')
  , models     = require('./models')
  , passport   = require('passport')
  , bodyparser = require('body-parser')
  , winston    = require('winston')
  ;

winston.level = 'debug';

var app    = express()
  , locals = app.locals
  , server = http.createServer(app)
  , error  = winston.error.bind(winston)
  , logger = winston.debug.bind(winston, '***LOG: ')
  , warner = winston.warn.bind(winston)
  , io     = sockets(server)
  ;

locals.error = error;
locals.logger = logger;
locals.warner = warner;
locals.socket = io;

/*
 Checking the command line options
 */
var cmdOptions = options({
      compress: true,   // Use compression
      dir:      'dev',  // Root dir of frontend modules
      filelog:  false,  // Enable file serve logging
      help:     false,  // Print help and exit
      initdata: false,  // Clear and Initiate the DB contents
      port:     PORT    // Server port number
    })
  , subDir     = cmdOptions.dir || '.'
  , dir        = path.normalize(__dirname + '/../' + subDir) + '/'
  , initData   = cmdOptions.initdata
  ;

/*
 Compression.
 */

if (cmdOptions.compress) {
  var shouldCompress = function (req, res) {
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false;
    }
    // fallback to standard filter function
    return compressor.filter(req, res);
  };
  app.use(compressor({level: 1, filter: shouldCompress}));
}

/*
 Static file serve logging.
 */

if (cmdOptions.filelog) {
  app.use(function (req, res, next) {
    var filename = path.basename(req.url);
    logger('*** SERVED:', filename);
    next();
  });
}

/*
 Connecting to the database.
 */

db_driver(DB_URI, function (err, connection, mongoose) {

  var data;

  if (err) {
    locals.error('Failed to connect:', err);
    process.exit(1);
  } else {
    logger('Using DB:', DB_URI);

    //  The 'locals' object provides all the application specific custom data
    //  to different functional modules.
    //  @link(http://expressjs.com/4x/api.html#app.locals)
    locals.db = {
      connection: connection,
      mongoose:   mongoose
    };

    models(app);        // Initiate all DB model stuff

    locals.sessions = require('./lib/sessionManager')(app);

    app.use(bodyparser.json()); //this allows me to retrieve the data from the forms.
    app.use(bodyparser.urlencoded({extended: false}));

    require('./lib/passport')(app, passport); // setup passport
    app.use(passport.initialize());

    require('./lib/routes')(app); // setup the routes for my API

    if (initData) {
      data = require('./models/_default-data');
      require('./lib/db-init')(app, data);
    }

    /*
     Ordinary HTTP server stuff here.
     */

    app.use(express.static(dir));
    app.use('/vendor', express.static(dir + '../vendor'));
    app.use('*.html', express.static(dir));

    slots(app);

    server.listen(cmdOptions.port);

    logger('Server at:', dir,
      'is listening port', '#' + cmdOptions.port);
  }
});
