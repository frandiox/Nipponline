var session = require('../app/src/session.js'),
	database = require('./database.js');

module.exports = {
    index: function(req, res) {
        //res.render('index');
	var name = "anonymous";
		database.getUserFields(req.session.passport.user,['username'],function(err,fields){
			if(!err){
				name = fields.username;
			}

			res.send('Welcome, '+name+'!');
		});
    }
};
