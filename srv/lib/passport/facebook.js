/**
  * Passport configuration for login with facebook
  * @author Osmay Y. Cruz Alvarez <osmay.cruz@gmail.com>
  *
 **/

'use strict';

var FacebookStrategy = require('passport-facebook').Strategy
,  mongoose = require('mongoose')
,  User = mongoose.model('User')
;

var fb_app_id = '609077905916605';
var fb_app_secret = 'd96c1e9d200247f8b7e5b2d238a7f437';
var fb_permisions = ['email', 'id', 'first_name', 'last_name', 'gender'];

module.exports = new FacebookStrategy({
    clientID: fb_app_id,
    clientSecret: fb_app_secret,
    callbackURL: 'http://localhost:1111/auth/facebook/callback',
    profileFields: fb_permisions,
}, function (accessToken, refreshToken, profile, done) {
	// If the user exist already just get the user profile from the database
	User.findOne({'email':profile.emails[0].value},function(err, user){
		if(err) console.log(err);
		if(user){
			console.log('That username is in use');
			console.log(user);
			return done(null, user);
		}else{ // If the user doesn't exist create a new one.
			var newuser = new User({
				'email':profile.emails[0].value,
				'firstName': profile.name.givenName,
				'lastName': profile.name.familyName,
				'identities':[{'provider': 'Facebook', 'identity': profile.id}]
			});

			newuser.save(function(err){
				if(err) console.log(err);
			});

			console.log(newuser);
			return done(null, newuser);
		}
	});
	
});