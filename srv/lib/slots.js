/**
 * lib/slots.js
 *
 * Slots (mutually visible users) management.
 *
 * todo: check for hung connections.
 *
 * @author Villem Alango <villem.alango@gmail.com>
 */

'use strict';

/* globals setTimeout: false */

/** @typedef {string}  slot identity type. */
module.SlotId;

/** @const {number}  Maximum idle time after wht the connection is killed */
//var MAX_AGE = 5 * 1000;

var LOCATION = 'Location';

var connection
  , logger
  , mongoose
  , Location
  ;

/**
 * Slot has all the data about remote client and socket connection.
 *
 * @param {module.SlotId} identity
 * @constructor
 */
var Slot = function Slot(identity) {

  this.id = identity;
  this.socket = null;
  this.last = null;
};

/**
 * Check if the last communication is below the horizon, then mark as unused.
 *
 * @param {number} bottom
 * @returns {Slot}
 */
Slot.prototype.check = function (bottom) {
  if (this.last && this.last < bottom) {
    logger('Slot', this.id, 'expires');
    this.last = null;
    this.socket = null;
  }
  return this;
};

/**
 * Refresh the last communication time.
 *
 * @returns {Slot}
 */
Slot.prototype.touch = function () {
  this.last = Date.now();
  return this;
};

/** @dict   A dictionary of slots by identity. */
var slots = {};

/**
 * A factory function that creates a slot and puts it into dictionary.
 *
 * @param {app.SlotId} identity
 */
var addSlot = function (identity) {
  slots[identity] = new Slot(identity);
};

/**
 * Find a slot by id.
 *
 * @param {app.SlotId} id
 * @returns {?Slot}
 */
var findSlot = function (id) {
  return slots[id];
};

/**
 * A slots iterator helper function, similar to Array.prototype.some.
 *
 * @param {function(Slot):*} cb
 * @returns {*}   - the first non-falsey value reaturned by cb.
 */
var aSlot = function (cb) {
  var names = Object.getOwnPropertyNames(slots), i = names.length, v, r;
  while (--i >= 0) {
    (v = slots[names[i]]) && (r = cb(v));
    if (r) {
      return r;
    }
  }
  return null;
};

Slot.add = addSlot;
Slot.iterate = aSlot;
Slot.find = findSlot;

/**
 * Initialize the stuff
 * @param {Express.application} app
 */
var init = function (app) {

  var tmp = app.locals;
  var io = tmp.socket;
  logger = tmp.logger;

  mongoose = (tmp = tmp.db).mongoose;
  connection = tmp.connection || mongoose.connection;
  Location = mongoose.models[LOCATION];

  /*
   Set up socket connection event handlers.
   */
  io.on('connection', function (socket) {
    logger('connection');

    socket.on('join', function (arg) {
      var id = assignSlot(socket);
      logger('joinedId', id);
      if (id) {
        socket.broadcast.emit('has-joined', {loc: arg, id: id});
      }
    });
  });

  io.on('add-client', function () {
    logger('add-client');
  });


  /**
   * Reply asynchronously.
   *
   * @param socket
   * @param {string} what
   * @param data
   */
  var reply = function (socket, what, data) {
    setTimeout(function () {
      socket.emit(what, data);
    }, 1);
  };

  /**
   * Assign a slot for the socket (connection) and assign an ID.
   *
   * @param socket
   * @returns {?app.SlotId}
   */
  var assignSlot = function (socket) {

    var doc;
    var slot = aSlot(function (slot) {
      if (slot.socket === socket) {
        logger('re-assigning', slot.id);
        return slot;
      }
      if (slot.socket === null) {
        logger('assigning', slot.id);
        slot.socket = socket;
        return slot;
      }
      return null;
    });

    if (slot) {
      socket.clientId = slot.id;
      reply(socket, 'assign-id', slot.id);

      socket.on('leave', function (arg) {
        var slot = findSlot(arg);
        logger('leave', arg);
        slot && (slot.socket = null);
        socket.broadcast.emit('has-left', arg);
        socket.clientId = null;
      });

      socket.on('move', function (arg) {
        var uId = socket.clientId;

        logger('move', uId, arg);
        socket.broadcast.emit('has-moved', {loc: arg, id: uId});
        doc = new Location({userId: uId, lon: arg[0], lat: arg[1]});
        doc.save(function (err) {
          err && console.error(err);
        });
      });
      return slot.id;
    } else {
      //  Here if we could not get a slot.
      socket.emit('refused', 'too much clients');
    }
    return null;
  };

  /*
   var checkSlots = function () {
   var bottom = Date.now() - MAX_AGE;

   onSlots(function (item) {
   item.check(bottom);
   });
   };
   */

  /*
   Create a fixed number of slots - for demo only!
   */
  addSlot('blue');
  addSlot('green');
  addSlot('black');
  addSlot('red');
  addSlot('yellow');
};

/*
 For testing purposes...
 */
init.Slot = Slot;
init.dictionary = slots;

exports = module.exports = init;
