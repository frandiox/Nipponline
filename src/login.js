var database = require('./database.js'),
	bcrypt = require('bcrypt');

exports.loginLocal = function(user, pass, callback){
	if(!user || !pass){
		callback(new Error('User or password not provided'));
	}
	else{
		database.getUidByUsername(user, function(err, uid){
			if(err){
				callback(err);
			}
			else{
				database.getUserFields(uid,['password'],function(err, fields){
					bcrypt.compare(pass, fields.password, function(err,res){
						if(err){
							callback(err);
						}
						
						if(!res){
							callback(new Error('Wrong password'));
						}
						else{
							callback(null, {user: {uid:uid}});
						}
					});
				});
			}
		});
	}
}