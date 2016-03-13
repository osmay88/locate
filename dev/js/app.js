/**
 * app.js
 *
 * Setting up the configurations and orchestrating the modules.
 *
 * Todo: implement correct logic and code patterns.
 *
 * @author: Villem Alango <villem.alango@gmail.com>
 */

requirejs(['config', 'eventist', 'jquery'],
  /**
   *
   * @param {@dict} config
   * @param {object} eventist
   */
  function (config, eventist) {

    'use strict';

    var bus    = eventist()
      , ev     = config.events
      , global = window
      ;

    config.eventBus = bus;
    config.debug = debug;
    config.tracer = tracer;

    var trace = config.tracer(debug, 'EVENT:') || config.noop;

    bus.hook(function (args) {
      if (!args[0]) {
        throw new Error('Unspecified event');
      }
      trace(args);
    });

    global.onunload = function () {
      bus.emit(ev.appTerminates);
    };

    require(['login', 'any-thing']);
    require(['sync', 'ui-root']);

    /* ---------------------------------------------------------------------
     Debugging and tracing.
     */

    function debug() {
      console.log.apply(console, arguments);
    }

    /**
     * A factory function to create a dedicated trace method.
     *
     * @param {function} sink - what will actually render the information.
     * @param label - to be prepended to the trace.
     * @returns {Function}
     */
    function tracer(sink, label) {
      return function (args) {
        var d = Array.prototype.slice.call(args);
        d.unshift(label);
        sink.apply(null, d);
      };
    }

  });
