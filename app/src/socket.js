var	express = require('express'),
	nconf = require('nconf'),
	socketCookieParser = express.cookieParser(nconf.get('sessionSecret')),
	db_syllables = require('../../controllers/app_syllables.js'),
	session = require('./session.js'),
	utils = require('./utils.js');

exports.configure = function(io){
	// Configuring sockets
	io.sockets.on('connection', function (socket) {

		var sessionID, uid;
		var game1Best, game1Streak;

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
		socket.on('getsyllables', function (data, callback){

			db_syllables.getSyllables({$and: [{ obsolete : { $exists : false } }]}, function(err,docs){
				if(err){
					console.log('Error getting the syllables: '+err);
				}
				else{
					if(uid !== 0){
						db_syllables.getGame1Stats(uid.toString(),function(err,stats){
							if(err){
								console.log('Error getting user stats: '+err);
							}
							else{
								game1Best = stats.best;
								game1Streak = 0;
								callback([docs,stats.best]);
							}
						});
					}
					else{
						game1Best = 0;
						game1Streak = 0;
						callback([docs,0]);
					}
				}
			});


		});

		// Estadisticas del juego 1
		socket.on('game1:stats', function(stats, callback){
			if(uid !== 0){
				utils.checkGame1Stats(game1Best,stats[0],game1Streak,stats[1],function(err){
					if(err){
						console.log('Error in stats received: '+err);
					}
					else{
						game1Best = stats[0].best;
						db_syllables.updateGame1Stats(uid.toString(),stats[0],function(err){
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

