/**
 * ui-map.js
 *
 * Basic map interface.
 */

/* jshint sub: true */
/* globals goog: false, ol: false, COMPILED: false */

goog.provide('app.ui.map');

if (COMPILED) {
  goog.require('ol');
  goog.require('ol.Map');
  goog.require('ol.View');
  goog.require('ol.animation');
  goog.require('ol.control.ScaleLine');
  goog.require('ol.layer.Tile');
  goog.require('ol.source.OSM');
}

define(['config'], function (config) {

  'use strict';

  var ZOOM_DURATION = 500
    ;

  var initOSM = function () {
    var source = new ol.source.OSM();
    var base = new ol.layer.Tile({source: source});
    return [base];
  };

  var bus = config.eventBus;
  var ev = config.events;
  var mapConf /** @dict */ = config['opt.ui.map'] || {};
  var mapTarget = mapConf['target'] || 'map';
  var properties = {};
  var map, view;
  var stopZoom = 14;
  var minZoom = 2;
  var gridSize = 4000;
  var matrixIds = [];
  var resolutions = [];

  for (var z = 0; z < stopZoom; ++z) {
    resolutions.push(gridSize / Math.pow(2, z));
    matrixIds.push(z);
  }

  properties['resolutions'] = resolutions;

  var viewOptions = {
    center:      [2839264, 8109805],
    resolutions: resolutions.slice(minZoom, stopZoom),
    resolution:  resolutions[3]
  };

  map = new ol.Map({
    controls:                ol.control.defaults({
      attribution: false,
      rotate:      false,
      zoom:        false
    }).extend([new ol.control.ScaleLine({units: 'metric'})]),
    layers:                  initOSM(),
    loadTilesWhileAnimating: true,
    view:                    new ol.View(viewOptions),
    target:                  mapTarget
  });

  if (bus) {

    var emitLocation = function () {
      bus.emit(ev.uiMapMoved, view.getCenter());
    };

    view = map.getView();

    view.on('change:center', emitLocation);

    bus.on(ev.uiMapQLoc, function () {
      return view.getCenter();
    });

    bus.on(ev.uiMapZoom, function (amount, duration) {
      var zoom;

      zoom = ol.animation.zoom({
        resolution: view.getResolution(),
        duration:   duration || ZOOM_DURATION
      });
      map.beforeRender(zoom);
      view.setZoom(view.getZoom() + amount);
    });

  }

  map['properties'] = properties;
  return map;
});
