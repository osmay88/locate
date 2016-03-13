/**
 * sessions.test.js
 *
 * todo: add database manipulation tests
 *
 * @author Villem Alango <villem.alango@gmail.com>
 */

'use strict';

function noop() {
}

var should   = require('should')
  , sessions = require('../../../srv/lib/sessions')
  , app      = {locals: {logger: noop, warner: noop, error: noop}}
  ;

describe('lib/sessions', function () {

  describe('DI pattern compatibility', function () {
    it('should export as expected', function () {
      var exp = sessions(app);
      exp.should.be.a.Function();
      exp.open.should.be.a.Function();
      exp.close.should.be.a.Function();
      exp.getById.should.be.a.Function();
      exp.getByKey.should.be.a.Function();
    });
  });

  describe('argument validity checks', function () {

    it('getById() should throw an error on illegal sessionId', function () {
      (function () {
        sessions.getById(null);
      }).should.throw(TypeError, /string/);
    });
    it('getByKey() should throw an error on illegal sessionKey', function () {
      (function () {
        sessions.getByKey(null);
      }).should.throw(TypeError, /string/);
    });
    it('open() should throw an error on no model', function () {
      (function () {
        sessions.open({});
      }).should.throw(Error, /Session/);
    });
  });

  xdescribe('functions', function () {
    var user = {id: 'u1', email: 'a@b.c'}, session;

    beforeEach(function (done) {
      sessions(app);
      sessions.open(user, function (e, d) {
        if (e) {
          return done(e);
        }
        session = d;
        done();
      });
    });

    it('should find by sessionId', function () {
      var r = sessions.getById(session.id);
      should(r.key).be.equal(session.key);
    });
    it('should find by sessionKey', function () {
      var r = sessions.getByKey(session.key);
      should(r.id).be.equal(session.id);
    });
    it('close() should throw an error on invalid sessionId', function () {
      (function () {
        sessions.close('s1');
      }).should.throw(Error);
    });
    it('close() should remove the session', function () {
      sessions.close(session.id);
      should(sessions.getById(session.id)).be.equal(null);
      should(sessions.getByKey(session.key)).be.equal(null);
    });
  });

  describe('database interactions', function () {
    var sess1, mongoose, user;

    before(function (done) {
      mongoose = require('../setup-db')(
        app,
        '../../srv/models/_default-data',
        function (err) {
          if (err) {
            return done(err);
          }
          mongoose.connection.model('User').find(
            {email: 'gabrielm.doe@gmail.com'},
            function (e, r) {
              if (e) {
                return done(e);
              }
              user = r;
              sessions(app);
              done();
            });
        });
    });

    beforeEach(function (done) {
      // Here we check for cessionKey correctness - just manually, though
      sessions.open(user, function (e, d) {
        e || (sess1 = d);
        //done(e);
      });
      sessions.open(user, function (e, d) {
        e || (sess1 = d);
        done(e);
      });
    });

    it('should get session by id', function () {
      sessions.getById(sess1.id).should.be.equal(sess1);
    });

    it('should get session by key', function () {
      sessions.getByKey(sess1.key).should.be.equal(sess1);
    });

    it('should close session', function (done) {
      sessions.close(sess1.id, 'CLOSED');
      should(sessions.getById(sess1.id)).be.equal(null);
      done();
    });
  });
});
