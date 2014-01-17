var database = require('./database.js'),
	bcrypt = require('bcrypt');

exports.loginLocal = function(user, pass, callback){
	if(!user || !pass){
		return callback(new Error('User or password not provided'));
	}
	else{
		database.getUidByUsername(user, function(err, uid){
			if(err){
				return callback(err);
			}
			else{
				database.getUserFields(uid,['password','banned'],function(err, fields){
					if(err){
						return callback(err);
					}

					if(fields.banned === 1){
						return callback(new Error('User is banned'));
					}

					bcrypt.compare(pass, fields.password, function(err,res){
						if(err){
							return callback(err);
						}
						
						if(!res){
							return callback(new Error('Wrong password'));
						}
						else{
							return callback(null, {user: {uid:uid}});
						}
					});
				});
			}
		});
	}
}