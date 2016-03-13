/**
 * js/user.js
 *
 * Client side user handler.
 *
 * @author Andrius Lokotaš <andrius.lokotas@gmail.com> (main code)
 * @author Villem Alango <villem.alango@gmail.com> (uniform API)
 */

/*
 This is a client side user handler, it contains both public and private keys
 for session management and provides the ability to store it in sessionStorage.
 It also contains predefined configuration and automatic save on
 document navigation.
 */
define(['config'], function (config) {

  'use strict';

  // User construct
  var usr = {
    sessionId:    null,
    sessionKey:   null,
    userId:       null,
    sessionStart: null,
    displayName:  null
  };

  var api = {                 // Public API
        current:   usr,
        clear:     clear,
        saveState: serialize  // for manual saving
      }
    , bus = config.eventBus
    , ev  = config.events
    ;


  function clear() {
    usr.sessionId = usr.sessionKey = usr.userId = usr.sessionStart =
      usr.displayName = null;
    serialize();
  }

  // private functions
  function serialize() {
    // store current user value object in session storage as JSON string.
    sessionStorage.setItem(config.auth.sessionKey, JSON.stringify(usr));
  }

  function deserialize() {
    // check if session storage has user object set, if not leave defaults.
    var val = sessionStorage.getItem(config.auth.sessionKey);

    if (!val) {
      return;
    }
    try {
      usr = JSON.parse(val);
    }
    catch (e) {
      // values in sessionstorage are bad, kill it.
      if (config.auth.debug) {
        config.debug('Session storage has bad value of: "',
          val, '" - clearing it.');
      }
      sessionStorage.removeItem(config.auth.sessionKey);
    }
  }

  // Execute  binders on runtime

  // Try to load current values from storage,
  // but not when we are debugging the auth mechanisms.
  if (!config.auth.debug) {
    deserialize();
  }

  // wire up automatic saving on page close / navigate
  bus.on(ev.appTerminates, serialize);

  return api;
});
