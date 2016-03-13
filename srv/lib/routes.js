/**
 * lib/routes.js
 *
 *   The routing system for my app
 *
 *   @author: Osmay Y. Cruz Alvarez <osmay.cruz@gmail.com>
 *   @author: Villem Alango <villem.alango@gmail.com>
 */

'use strict';

/*
 HTTP response status codes.
 @link(https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
 */
var R_UNAURHORIZED = 401  // Authentication will be required
  , R_FORBIDDEN    = 403
  , R_EXPIRED      = 419  // Previously valid authentication has expired
//  , R_BAD          = 400  // Bad request syntax or alike
  , R_OK           = 200
  ;

var FUTURE = false;       // Use in conditionals to exclude draft code.

var SSID = 'ovela.ssid';

var passport = require('passport')
  , util     = require('util')
  ;

var locals
  , sessions
  , logger
  , error
  , User
  ;
  
/**
 * This little method take the user object and pick the fields to be send
 * @param {User}
 * 
 */
function userConstruct(user){
}

/**
 * Print the request data for debugging.
 *
 * @param {string} msg
 * @param {express.Request} req
 */
function debugReq(msg, req) {
  console.log('***', msg, '\n ** HDRS:', req.headers, '\n ** BODY:', req.body);
}

/**
 * Open a new user section and send appropriate response.
 *
 * @param req
 * @param res
 * @param user
 */
function openSession(req, res, next, user) {
  sessions.open(user, function (err, info) {

    var jsonInfo;

    if (err) {
      locals.error(err, info);
      return next(err);
    }
    if (FUTURE) {  // Peeking for some extra stuff...
      logger('IP', req.ip, 'A', req.connection.remoteAddress, 'H',
        req.headers['x-forwarded-for']);
      logger('IPS', req.ips);
    }
    jsonInfo = {
      sessionId:    info.id,
      sessionKey:   info.key,
      displayName:  user.email,
      sessionStart: info.created
    };
    logger('Session Started\n', util.inspect(jsonInfo));
    res.json(jsonInfo);
  });
}

/*
 General Rules for Secured URIs:
 ===============================
 1. sessionId must be present:
 - otherwise R_UNAURHORIZED;
 2. sessionId must match an active session:
 - otherwise search from Database:
 ..- found: R_EXPIRED;
 ....- some sort of quick reconnect feature may be implemented in future
 ....  for better UX (consider users temporarily losing mobile connectivity).
 ..- not found: SECURITY ALERT!
 */
function checkSecure(req, res, strategy) {
  var info, sessionKey;

  if (!(sessionKey = req.headers[SSID])) {
    return res.sendStatus(R_UNAURHORIZED) && void 0;  // Immediate: failed
  }
  if (!(info = sessions.getById(sessionKey))) {
    if ('function' !== typeof strategy) {
      res.status(R_EXPIRED).send('Session expired');
      return void 0;
    }
    sessions.getExpired(sessionKey, function (e, d) {
      //  Here we'll give an asynchronous result!
      logger('expired', e, d);
    });
    // info === null here!
  }
  return info;  // Immediate: success
}

module.exports = function (app) {

  locals = app.locals;
  sessions = locals.sessions;
  error = locals.error;
  logger = locals.logger;
  User = locals.db.connection.model('User');

  /**
   * Log in the user in the system.
   *
   * The user can not be logged in already.
   * The fields 'username' and 'password' in request body are credentials.
   */
  app.post('/login', function (request, response, next) {
    console.log(request.headers);
    return passport.authenticate('local', function (err, user, info) {
      err && logger('AUTH-ERR', err);
      info && logger('AUTH-INFO', info);
      if (user) {
        sessions.getByUserId(user.id, function(err, data){
          if(data){
            console.log('User already login: \n ' + data);
            response.status(R_UNAURHORIZED).json(data);
          }else{
            openSession(request, response, next, user);
          }
        }); 
      } else {
        logger('Wrong here!');
        return response.status(R_UNAURHORIZED)
          .send('Password or username combination doesn´t match');
      }
    })(request, response, next);
  });

  /**
   * Handle the user registration in the database.
   *
   * The user can not be logged in already.
   *
   * NOTE: the others fields in the database are handled by
   * the users settings page
   *
   * @email: String
   * @password: String
   */
  app.post('/register', function (request, response) {

    //debugReq('POST/register', request);
    logger(request.body.email);
    var email = request.body.email; // there isn't such!
    var password = request.body.password;
    var firstname = request.body.firstname || null;
    var lastname = request.body.lastname || null;
    logger('BODY\n', util.inspect(request.body, {depth: 1}));

    User.findOne({'email': email}, function (err, user, next) {
      if (err) next(err);
      if (user) {
        logger('this email is already in use', email);
        logger(util.inspect(user, {depth: 1}));
        response.status(400).send('This email is already in use');
      } else {
        logger('user will be created');
        var newuser = new User({
          'email': email,
          'firstName':firstname,
          'lastName':lastname
        });
        newuser.setPassword(password);
        newuser.save(function (err, args, next) {
          if (err) {
            logger(err);
            next(err);
          }
          else {
            logger('User saved');
            openSession(request, response, next, user);
            response.status(R_OK).send();
          }
        });
      }
    });
  });

  app.get('/auth/facebook', passport.authenticate('facebook'),
    function (request, response) {
      // todo: implement
      debugReq('GET/auth/facebook', request);
    });

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook',
      {redirectFailure: 'http://localhost:1111/login'}),
    function (request, response) {
      debugReq('GET/auth/facebook/callback', request);
      //Aqui creo la session y se la envio al usuario
      //Sesion
      // todo: implement
      response.redirect('/');
    });

  app.get('/auth/google', passport.authenticate('google'),
    function (request, response) {
      // todo: implement
      debugReq('GET/auth/google', request);
    });

  app.get('/auth/google/return', passport.authenticate('google', {
      // todo: implement
      successRedirect: '/',
      failureRedirect: '/'
    }
  ));

  app.get('/logout', function (request, response) {
    debugReq('GET/logout', request);
    var info = checkSecure(request, response);
    if (info) {
      sessions.close(info.id);
      request.logout();         // passport package
      // NB: because of S.P.A. redirect can not be done here
      //response.end();
      response.sendStatus(R_OK);
    }
  });
  /**
   * This request shall be called right after the user login in the page
   * to request all the information and settings from the current user
   * 
   * @author Osmay Y. Cruz Alvarez <osmay.cruz@gmail.com>
   * @return json object | 401
   */
  app.get('/me', function(request, response){
    var sessionKey;
    if(!(sessionKey = request.headers[SSID])){
      response.status(404);
    }
    var info = sessions.findByKey(sessionKey);
    User.findOne({'id': info.userId}, function(err, user){
      if(err) logger(err);
      if(!user) response.json(null);
      //todo: there is no need to send all the user fields so we just pick up the main ones
      var puser = userConstruct(user);
      response.json(puser);
    });    
  });
  
  app.post('/search', function(request, response){
    logger(sessions.validate(request.header['sessionId'] || null, request.headers['sessionKey'] || null));
    /*if(sessions.validate(request.header['sessionId'], request.headers['sessionKey']).valid){*/
    if(true){ //this here is to test in the console
      // the session is valid
      //I look for a person in the user list
      var param = request.body.param;
      logger(param);
      if(param.indexOf('@') > 0){ //dummy check to see if the param is and email 
        //TODO: this method is just for testing
        User.findByEmail(param, function(err, user){
          if(err){logger(err);}
          console.log(user);
          if(user){
            console.log(user);
            response.json({
              'userId': user.id,
              'fistname':user.firstName,
              'lastname':user.lastName,
              'email':user.email // this is only temporary
               });
          }else{
            response.json({});
          }
        });
      }
    }else{
      response.status(R_EXPIRED)
      .send('The session information is invalid, please login again.\n');
    }
  });
  
  app.post('/add', function(request, response){
    var sessionId = request.headers['sessionId']
    ,  sessionKey = request.headers['sessionKey']
    , sessionValidator = sessions.validate(sessionId, sessionKey)
    ;
    
    if(sessionValidator.valid){
      response.send(R_OK);
    }else{
      response.status(R_UNAURHORIZED).send(sessionValidator.reason);
    }
  });
};
