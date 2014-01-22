#!/usr/bin/node

/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	i18n = require('i18next'),
	path = require('path'),
	nconf = require('nconf'),
	database = require('./src/database.js'),
	session = require('./src/session.js'),
	socket = require('./src/socket.js');

nconf.file('config.json');

i18n.init({
	saveMissing: true,
	debug: true,
	resGetPath: 'public/locales/__lng__/__ns__.json'
});

var app = express();

// all environments
app.configure(function(){
	app.set('port', process.env.PORT || 3456);
	app.set('views', path.join(__dirname, 'views'));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(require('stylus').middleware({ src: __dirname + '/public' }));
	app.set('view engine', 'jade');
	app.use(i18n.handle);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());

	app.use(express.cookieParser());
	app.use(express.session({
  		store: session.sessionStore,
  		secret: nconf.get('sessionSecret'),
		key: 'express.sid',
		cookie: {
			maxAge: 60 * 60 * 24 * 30 * 1000
		}
	}));

	app.use(session.passport.initialize());
	app.use(session.passport.session());
	app.use(app.router);
	app.use(express.csrf());
});

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

var server = app.listen(app.get('port'));
var io = require('socket.io').listen(server);

// Configuring sockets
socket.configure(io);

// This line allows for the use of i18n translation inside templates (.jade)
i18n.registerAppHelper(server);


app.get('/', routes.index);

/////////TEST CODE FOR SESSIONS/////////////
app.get('/logout',function(req,res){
	req.logout();
	res.redirect('/login');
});

app.get('/welcome', function(req, res) {
	var name = "anonymous";
	database.getUserFields(req.session.passport.user,['username'],function(err,fields){
		
		if(!err){
			name = fields.username;
		}

		res.send('Welcome, '+name+'!');
	});

});

app.get('/login', function(req, res){

    var message = 'hola';
    var body = '<div><p>' + message + '</p></div>';
    body = body + '<form action="/login" method="post">';
    body = body + '<div><label>Username:</label>';
    body = body + '<input type="text" name="username"/><br/></div>';
    body = body + '<div><label>Password:</label>';
    body = body + '<input type="password" name="password"/></div>';
    body = body + '<div><input type="submit" value="Submit"/></div></form>';
    res.send(body);
});

app.post('/login', 
    session.passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/welcome');
	}
);

/////////////////////////////////////////////////////////

console.log('Express server listening on port ' + app.get('port'));
