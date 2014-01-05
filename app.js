#!/usr/bin/node

/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	i18n = require('i18next'),
	path = require('path'),
	database = require('./src/database.js');

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
	app.use(app.router);
});

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

var server = app.listen(app.get('port'));
var io = require('socket.io').listen(server);

// Configuring sockets
io.sockets.on('connection', function (socket) {

  // Respuesta en caso de peticion de silabas
  socket.on('getsyllabes',function (data, callback){

  	database.getSyllabes({$and: [{ obsolete : { $exists : false } }]}, function(err,docs){
  		callback(docs);
  	});

  });

});

// This line allows for the use of i18n translation inside templates (.jade)
i18n.registerAppHelper(server);


app.get('/', routes.index);

console.log('Express server listening on port ' + app.get('port'));


