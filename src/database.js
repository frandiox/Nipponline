var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    nconf = require('nconf'),
    utils = require('./utils.js');

nconf.file('config.json');

var authLang = nconf.get('db:lang:user') && nconf.get('db:lang:pass') ? nconf.get('db:lang:user')+':'+nconf.get('db:lang:pass')+'@' : '',
    authForum = nconf.get('db:forum:user') && nconf.get('db:forum:pass') ? nconf.get('db:forum:user')+':'+nconf.get('db:forum:pass')+'@' : '';

var dbLang = mongoose.createConnection('mongodb://'+authLang+nconf.get('db:lang:location')+':'+nconf.get('db:lang:port')+'/'+nconf.get('db:lang:name')),
    dbForum = mongoose.createConnection('mongodb://'+authForum+nconf.get('db:forum:location')+':'+nconf.get('db:forum:port')+'/'+nconf.get('db:forum:name'));

var syllabes = dbLang.model('syllabes', 
    new Schema({}, { collection : 'syllabes' }));

var users = dbForum.model('users',
    new Schema({}, { collection : 'objects'}));

exports.getSyllabes = function(find, callback){

    syllabes.find(find, function(err,docs){
        if(err){
            return callback(err);
        }

        if(docs == []){
            return callback(new Error('Syllabes not found'));
        }
        else{
            return callback(err,docs);
        }
    });

};

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

exports.getGame1Stats = function(uid, callback){

    users.findOne({'_key': 'uid:game1Stats'},{'_id':0}).select(uid).exec(function(err,doc){
        if(err){
            return callback(err);
        }

        if(!doc || doc == 'null'){
            return callback(new Error('Stats for game1 do not exist'));
        }
        else{
            return callback(null,doc.toJSON()[uid]);
        }
    });
}

exports.setGame1Stats = function(uid, newStats, callback){

    var stat = {};
    stat[uid] = newStats;

    users.collection.update({'_key': 'uid:game1Stats'},{$set:stat},function(err){
        if(err){
            return callback(err);
        }
        else{
            callback(null);
        }
    });
}

exports.updateGame1Stats = function(uid, stats, callback){

    module.exports.getGame1Stats(uid, function(err,oldStats){
        if(err){
            return callback(err);
        }
        else{
            
            utils.mergeGame1Stats(oldStats,stats,function(err,merged){
                if(err){
                    return callback(err);
                }

                module.exports.setGame1Stats(uid,merged,function(err){
                    if(err){
                        return callback(err);
                    }
                })
            });
        }

        return callback(null);
    });
}
