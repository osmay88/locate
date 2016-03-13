/**
 * sync.js
 *
 * Synchronization module using web socket services.
 *
 * todo: locations of others should be visible to logged-in user.
 *
 * @author Villem Alango <villem.alango@gmail.com>
 * @created 16.06.15 18:44
 */

define(['config', 'location-filter'], function (conf, filter) {

  /* jshint sub: true */
  /* globals io: false */

  'use strict';

  /** @const {string} */
  var MY_KEY     = 'sync-socket'
    , USE_FILTER = true
    ;

  var debug  = conf.debug
    , bus    = conf.eventBus
    , ev     = conf.events
    , socket = conf[MY_KEY]
    , id     = null
    , tracer = conf['tracer']
    , trr    = tracer(debug, 'RCV')
    , trs    = tracer(debug, 'SND')
    , x0     = 0, y0 = 0// will be obsolete as location-filter will work.
    ;

  if (!socket) {
    if ('function' === typeof io) {
      socket = io();
    } else {
      debug('SYNC:', 'can not initialize!');
      return;
    }
  }
  if ((tracer = conf['modules']) && (tracer = tracer['tracer'])) {
    (trr = tracer(debug, 'SRECV:')) && (trs = tracer(debug, 'SSEND:'));
  }

  bus.once(ev.appTerminates, function () {
    id && (trs(['leave']) || socket.emit('leave', id));
  });

  bus.on(ev.userLoggedIn, function () {

    var loc = bus.emit(ev.uiMapQLoc);
    if (!loc) {
      throw new Error('can not retrieve map location');
    }
    filter.init();
    (x0 = loc[0]) && (y0 = loc[1]);  // will be obsolete...
    trs(['join', loc]);
    socket.emit('join', loc);
    bus.on(ev.uiMapMoved, uiMapMoved);
  });

  function uiMapMoved(place) {
    var fire = false;

    if(USE_FILTER){
      var loc = filter.check(place);
      if(loc){
        trs(['move', place]);
        socket.emit('move', place);
      }
      return;
    }
    // The code below will become obsolete as location-filter gets implemented.
    // The only feature that will remain 'lazy update'.
    if (!fire) {
      fire = true;
      if (place[0] !== x0 || place[1] !== y0) {
        (x0 = place[0]) && (y0 = place[1]);
        // Lazy update - make sure the updates won't be too frequent.
        setTimeout(function () {
          trs(['move', place]);
          socket.emit('move', place);
          fire = false;
        }, 100);
      }
    }
  }

  bus.on(ev.userLoggedOut, function () {
    bus.off(ev.uiMapMoved, uiMapMoved);
    id && (trs(['leave']) || socket.emit('leave', id));
  });

  socket.on('assign-id', function (arg) {
    trr(['assign-id', arg]);
    id = arg;
  });

  socket.on('refused', function (arg) {
    debug('refused', arg);
  });

  socket.on('has-moved', function (arg) {
    bus.send(ev.uiMarkSet, arg.id, arg.loc);
  });

  socket.on('has-joined', function (arg) {
    trr(['has-joined', arg]);
    bus.send(ev.uiMarkSet, arg.id, arg.loc);
  });

  socket.on('has-left', function (arg) {
    bus.send(ev.uiMarkKill, arg);
  });

  //  If connection is lost, application may decide if to retry or not.
  socket.on('reconnect_error', function (err) {
    debug('Connection failed:', err.message);
    bus.emit(ev.syncError, MY_KEY, err.message) || socket.close();
  });
});
