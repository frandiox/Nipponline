var	express = require('express'),
	nconf = require('nconf'),
	socketCookieParser = express.cookieParser(nconf.get('sessionSecret')), 
	database = require('./database.js'),
	session = require('./session.js'),
	utils = require('./utils.js');

exports.configure = function(io){
	// Configuring sockets
	io.sockets.on('connection', function (socket) {

		var sessionID, uid;
		var game1Best;

		socketCookieParser(socket.handshake, {}, function(err) {
			sessionID = socket.handshake.signedCookies['express.sid'];
			session.sessionStore.get(sessionID, function(err, sessionData) {
				if (!err && sessionData && sessionData.passport && sessionData.passport.user) {
					uid = sessionData.passport.user;
				} else {
					uid = 0;
				}

				socket.emit('acknowledge',uid===0 ? false : true);
			});
		});

		// Respuesta en caso de peticion de silabas
		socket.on('getsyllabes', function (data, callback){

			database.getSyllabes({$and: [{ obsolete : { $exists : false } }]}, function(err,docs){
				if(err){
					console.log('Error getting the syllabes: '+err);
				}
				else{
					if(uid !== 0){
						database.getGame1Stats(uid.toString(),function(err,stats){
							if(err){
								console.log('Error getting user stats: '+err);
							}
							else{
								game1Best = stats.best;
								callback([docs,stats.best]);
							}
						});
					}
					else{
						game1Best = 0;
						callback([docs,0]);
					}
				}
			});


		});

		// Estadisticas del juego 1
		socket.on('game1:stats', function(stats, callback){
			
			if(uid !== 0){
				utils.checkGame1Stats(game1Best,stats,function(err){
					if(err){
						console.log('Error in stats received: '+err);
					}
					else{
						game1Best = stats.best;
						database.updateGame1Stats(uid.toString(),stats,function(err){
							if(err){
								console.log('Error updating the statistics: '+err);
							}
							else{
								console.log('DB Updated');
							}
						});
					}
				});
			}

			return callback();
		});

	});
};

