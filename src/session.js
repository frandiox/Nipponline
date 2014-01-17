var express = require('express'),
	passport = require('passport'),
	passportLocal = require('passport-local').Strategy,
	nconf = require('nconf'),
	MongoStore = require('connect-mongo')(express),
	login = require('./login.js');

passport.serializeUser(function(user, done) {
	done(null, user.uid);
});

passport.deserializeUser(function(uid, done) {
	done(null, {uid: uid});
});

passport.use(new passportLocal(function(user, password, next) {
		login.loginLocal(user, password, function(err, login) {
			if (!err) {
				return next(null, login.user);
			} else {
				return next(null, false, err);
			}
		});
}));

exports.passport = passport;

var authForum = nconf.get('db:forum:user') && nconf.get('db:forum:pass') ? nconf.get('db:forum:user')+':'+nconf.get('db:forum:pass')+'@' : '';

exports.sessionStore = new MongoStore({url: 'mongodb://'+authForum+nconf.get('db:forum:location')+':'+nconf.get('db:forum:port')+'/'+nconf.get('db:forum:name')});
