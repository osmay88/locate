/**
 * config.js
 *
 * Application's configuration file.
 *
 * @author Villem Alango <villem.alango@gmail.com>
 * @created 26.08.15 10:41
 */

define(function () {

  'use strict';

  var config = {
    //  Function names should be verbs (the only exception is here).
    noop: function () {
    },

    //  Factory and object instance names should be nouns.
    DEBUG: true,

    //  Special subsections are created here, but will be filled in elsewhere.
    auth: {
      apiBase:    '/api/',
      debug:      true,           // Authentication debug mode flag.
      headerKey:  'ovela.ssid',   // The key we are using in req header.
      sessionKey: 'ovela.ssid'    // The key we are using in session storage.
    },

    events: {
      appReady:      'app.ready',         // App components are initiated
      appStarting:   'app.starting',
      appTerminates: 'app.terminates',    // Do your emergency data saving!
      uiTraceClick:  'ui.trace.click',    // (ctrl.id, ...) - for tracing.
      uiMapMoved:    'ui.map.moved',      // Map was panned.
      uiMapZoom:     'ui.map.zoom',       // Zoom the map view in or out.
      uiMapQLoc:     'ui.map.q.loc',      // Enquiry map location --> [x,y]

      uiMarkSet:  'ui.marker.set',     // Set a marker to the map.
      uiMarkKill: 'ui.marker.kill',    // Kill the marker on map.

      syncError: 'sync.error',

      userLoggedIn:    'user.session.beg',  // User logged in successfully
      userLoggedOut:   'user.session.end',  // User has logged out
      userLoginFailed: 'user.login.failed', // Only if credentials did nor match
      userModified:    'user.data.changed', // User profile changes were saved

      connData:  'conn.rcv.data',   // (data, id, jqXHR) - Ajax results.
      connError: 'conn.rcv.error',  // (error, id, jqXHR) - Ajax error received.

      xNoEvent: 0
    },

    modules: {
      //  Module names should be nouns.
    }
  };

  return config;
});
