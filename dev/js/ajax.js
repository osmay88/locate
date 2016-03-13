/// <reference path='../../typings/jquery/jquery.d.ts'/>

/*
 This is ajax caller factory, please avoid using jquery methods directly
 due to fact that we will need to include a custom header with sessionid
 */
define(['config', 'user', 'jquery'], function (config, user, $) {

  'use strict';

  // Public interface
  var api = {
    // Action object is used for intellisence, it contains HTTP VERB method to be preformed by AJAX call.
    // i.e. you can write call like: ajax.call(ajax.action.put,'url','data',successcallback,errorcallback);
    // you can call it via shorthand as well: ajax.call('PUT','url',,successcallback,errorcallback);
    action: {
      post:   'POST',
      put:    'PUT',
      get:    'GET',
      delete: 'DELETE'
    },
    call:   makeCall
  };

  var seed  = 0
    , bus   = config.eventBus
    , ev    = config.events
    ;

  /**
   * Initialize and execute an Ajax request.
   *
   * @param {string} verb
   * @param {string} url
   * @param {object=} data
   * @param {function(error=,object)=} cb
   * @returns {number} request ID
   */
  function makeCall(verb, url, data, cb) {

    var id       = seed++
      , settings = {
          type:       verb,
          beforeSend: function (request) {
            request.setRequestHeader(config.auth.headerKey, user.current.sessionId);
          },
          url:        url,
          data:       data || {},
          dataType:   'json',
          success:    dataHandler.bind(cb, id), // NB: 'this' will be 'cb'!
          error:      errorHandler.bind(cb, id)
        }
      ;

    $.ajax(settings);
    return id;
  }


  // Anything data, String textStatus, jqXHR jqXHR
  function dataHandler(id, data, status, jqXHR) {
    bus.emit(ev.connData, data, id, jqXHR);
    /* jshint validthis: true */
    this && this(null, data);
  }

  //  jqXHR jqXHR, String textStatus, String errorThrown
  function errorHandler(id, jqXHR, status, error) {
    if ('string'===typeof error && jqXHR.status !== 200) {
      error = new Error(jqXHR.responseText);
      error.status = jqXHR.status || status;
    }
    bus.emit(ev.connError, error, id, jqXHR);
    /* jshint validthis: true */
    this && this(error);
  }

  return api;
});
