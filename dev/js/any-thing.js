/**
 * js/any-thing.js
 *
 * 'Anything REST request emulator' - this can be used as template for UI code.
 *
 * @author Andrius Lokotaš <andrius.lokotas@gmail.com>
 */
define(['config', 'user', 'ajax', 'jquery'],
  function (config, user, ajax, $) {

  'use strict';

  var bus = config.eventBus;

  // Please define all UI ID's as values here to avoid ID mix-ups and typos!
  var ui = {
    buttonTest: '#buttonTest'
    /*events:     {
      testClick:     "test.click",
      testData:      "testData",
      testDataError: "testDataError"
    }*/
  };

  bus = config.eventBus;
  $(ui.buttonTest).on('click', clickTest);

  function clickTest() {
    //bus.emit(ui.events.testClick);
    require('login').logoff();
  }

});
