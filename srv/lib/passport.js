/**
 * Created by osmay on 4.08.15.
 */

var facebook = require('./passport/facebook')
  , local    = require('./passport/local')
  ;

exports = module.exports = function (app, passport) {

  passport.User = app.locals.db.mongoose.models['User'];

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  // Here i setup the middleware for passport
  passport.use('facebook', facebook);
  passport.use('local', local);
};
