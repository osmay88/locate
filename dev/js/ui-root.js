/**
 * ui-root.js
 *
 * A shim file for hiding UI plugin structure from application code.
 *
 * Here we assemble necessary modules that will be compiled and loaded
 * as one in production mode.
 */

/* jshint sub: true */
/* globals goog: false, COMPILED: false */

goog.provide('app.ui.maproot');

if (COMPILED) {
  goog.require('app.ui.map');
  goog.require('app.ui.mrk');
  goog.require('app.ui.location');
}

define(['config', 'ui-map', 'ui-markers', 'ui-location'],
  function (config, mMap, mMrk, mLoc) {

    'use strict';

    var map
      , bus   = config.eventBus
      , doc   = document
      , ev    = config.events
      , zoomI = doc.getElementById('zoom-in')
      , zoomO = doc.getElementById('zoom-out')
      ;

    config['ui.crosshair.id'] = 'crosshair';
    config['ui.map'] = map = mMap;
    config['ui.location'] = mLoc;

    if (bus && zoomI && zoomO) {
      zoomI.addEventListener('click', function () {
        bus.emit(ev.uiMapZoom, 1);
      }, false);
      zoomO.addEventListener('click', function () {
        bus.emit(ev.uiMapZoom, -1);
      }, false);
      zoomI['style']['display'] = zoomO['style']['display'] = 'block';
    }

    /*
     enableCompass = enableCompass ? true : pageParams.orient;

     geoLocation = initGeolocation(view);
     */
  });
