var passport = require('passport'),
	passportLocal = require('passport-local').Strategy,
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
				next(null, login.user);
			} else {
				next(null, false, err);
			}
		});
}));

exports.passport = passport;
