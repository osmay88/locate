/**
 * js/location-filter.test.js
 *
 * @author Villem Alango <villem.alango@gmail.com>
 * @created 31.08.15 00:15
 */

'use strict';

var requirejs = require('requirejs');

requirejs.config({
  baseUrl:     './dev/js',  // Relative to where we are when running ;-)
  nodeRequire: require
});

var should = require('should')
  ;

describe('js/location-filter', function () {
  var target
    , loc  = [718178.9829, 1101.222828]
    , tol  = [0.1, 0.1]
    , LESS = 0.99
    , MORE = 1.01
    , DIAG = Math.sqrt(2) / 2
    , DL   = DIAG * LESS
    , DM   = DIAG * MORE
    ;

  beforeEach(function (done) {
    requirejs(['location-filter'], function (f) {
      target = f;
      target.init(tol[0], tol[1]);
      done();
    })
  });

  it('should return the same stuff after init()', function () {
    target.check(loc).should.deepEqual(loc);
  });

  it('should return value on off tolerance by x', function () {
    var loc1 = [loc[0] + MORE * tol[0], loc[1]];
    target.check(loc);
    target.check(loc1).should.deepEqual(loc1);
  });

  it('should return value on off tolerance by y', function () {
    var loc1 = [loc[0], loc[1] + MORE * tol[1]];
    target.check(loc);
    target.check(loc1).should.deepEqual(loc1);
  });

  it('should return value on off tolerance by diag', function () {
    var loc1 = [loc[0] - DM * tol[0], loc[1] + DM * tol[1]];
    target.check(loc);
    target.check(loc1).should.deepEqual(loc1);
  });

  it('should return null on repeated value', function () {
    target.check(loc);
    target.check(loc).should.equal(null);
  });

  it('should return null on in tolerance by x', function () {
    target.check(loc);
    target.check([loc[0] + LESS * tol[0], loc[1]]).should.equal(null);
  });

  it('should return null on in tolerance by y', function () {
    target.check(loc);
    target.check([loc[0], loc[1] + LESS * tol[1]]).should.equal(null);
  });

  it('should return null on in tolerance by diag', function () {
    target.check(loc);
    target.check([loc[0] - DL * tol[0], loc[1] + DL * tol[1]])
      .should.equal(null);
  });
});
