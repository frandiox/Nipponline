var models_users = require('../app/models/users'),
    users = models_users.users;

exports.getUidByUsername = function(username, callback){

    users.findOne({'_key': 'username:uid'},{'_id':0}).select(username).exec(function(err,doc){
        if(err){
            return callback(err);
        }

        doc = JSON.stringify(doc);

        if(!doc || doc == 'null'){
            return callback(new Error('User does not exist'));
        }
        else{
            return callback(null,JSON.parse(doc)[username]);
        }
    });

};

exports.getUserFields = function(uid, fields, callback){

    var selectQuery = '';
    for(var i=0; i<fields.length; i++){
        selectQuery += ' '+fields[i];
    }

    users.findOne({'_key': 'user:'+uid},{'_id':0}).select(selectQuery).exec(function(err,doc){
        if(err){
            return callback(err);
        }

        doc = JSON.stringify(doc);

        if(!doc || doc == 'null'){
            return callback(new Error('User or fields don\'t not exist'));
        }
        else{
            return callback(null,JSON.parse(doc));
        }
    });

};
