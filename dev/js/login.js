/**
 * js/login.js
 *
 * Login js handler.
 *
 * @author Andrius Lokotaš <andrius.lokotas@gmail.com>
 * @author Villem Alango <villem.alango@gmail.com> (uniform API)
 */
define(['config', 'user', 'ajax', 'jquery'],
  function (config, user, ajax, $) {

    'use strict';

    //  Public API
    var api = {
      logoff: clickLogOff
    };

    var R_UNAURHORIZED = 401;

    // Dummy credentials - just for debugging.
    var debugCredentials = [
      {username: 'tuuli@yo.com', password: 'tuuli'}
    ];

    //  Please define all UI ID's as values here to avoid ID mix-ups and typos.
    var ui = {
      buttonLogin: '#buttonLogin'
    };

    //  Ordinary variables. ;-)
    var bus = config.eventBus
      , ev  = config.events
      ;

    $(ui.buttonLogin).on('click', clickLogin);

    // function to authenticate session
    function clickLogin() {
      // call logon service and pass login object.
      ajax.call('POST', '/login', debugCredentials[0], function (err, data) {
        if (err) {
          err.status === R_UNAURHORIZED && bus.send(ev.userLoginFailed);
          return;
        }
        logOn(data);
      });
    }

    // function to end session
    function clickLogOff() {
      config.DEBUG && bus.send(ev.uiTraceClick, ui.buttonLogin);
      logoff();
    }

    function logoff() {
      ajax.call('GET', '/logout');
      bus.emit(ev.userLoggedOut, user);
      user.clear();
    }

    function logOn(data) {
      user.current.displayName = data.displayName;
      user.current.sessionId = data.sessionId;
      user.current.sessionKey = data.sessionKey;
      user.current.sessionStart = data.sessionStart;
      user.current.userId = data.userId;
      user.saveState();
      bus.send(ev.userLoggedIn, user.current);
    }

    return api;
  });
