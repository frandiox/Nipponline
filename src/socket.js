var	express = require('express'),
	nconf = require('nconf'),
	socketCookieParser = express.cookieParser(nconf.get('sessionSecret')), 
	database = require('./database.js'),
	session = require('./session.js');

exports.configure = function(io){
	// Configuring sockets
	io.sockets.on('connection', function (socket) {

		var sessionID, uid;

		socketCookieParser(socket.handshake, {}, function(err) {
			sessionID = socket.handshake.signedCookies['express.sid'];
			session.sessionStore.get(sessionID, function(err, sessionData) {
				if (!err && sessionData.passport.user) {
					uid = sessionData.passport.user;
				} else {
					uid = 0;
				}
			});
		});

		// Respuesta en caso de peticion de silabas
		socket.on('getsyllabes', function (data, callback){

			database.getSyllabes({$and: [{ obsolete : { $exists : false } }]}, function(err,docs){
				if(err){
					console.log('Error getting the syllabes: '+err);
				}
				else{
					callback(docs);
				}
			});


		});

		// Estadisticas del juego 1
		socket.on('game1:stats', function(stats, callback){
			console.log('Stats received: %j',stats);
			if(uid !== 0){
				// CHECK STATS RECEIVED FOR HAX 1337 DATA HERE, THEN IF ALL GOES WELL UPDATE
				database.updateGame1Stats(uid.toString(),stats,function(err,stats){
					if(err){
						console.log('Error updating the statistics: '+err);
					}
					else{
						console.log('DB Updated');
					}
				});
			}

			return callback();
		});

	});
};

