var session = require('../app/src/session.js');
var home = require('../controllers/home'),
	test = require('../controllers/test'),
    app_syllables = require('../controllers/app_syllables'),
    app_words = require('../controllers/app_words');

module.exports.initialize = function(app) {
    app.get('/', home.index);
	app.get('/login', test.login);
	app.post('/login',
        session.passport.authenticate('local', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/');
        }
    );
	app.get('/logout', test.logout);
	app.get('/syllables', app_syllables.index);
    app.get('/words', app_words.index);
};
