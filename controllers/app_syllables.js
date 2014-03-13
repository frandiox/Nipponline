var models_syllables = require('../app/models/syllables'),
    syllables = models_syllables.syllables,
    models_users = require('../app/models/users'),
    users = models_users.users,
    fs = require('fs'),
    utils = require('../app/src/utils.js');


exports.index = function(req, res){
    fs.readFile('./public/html/juego1.html', function (err, html) {
        if (err) {
            throw err;
        }
        else{
            res.writeHeader(200, {"Content-Type": "text/html"});
            res.write(html);
            res.end();
        }
    });
};

exports.getSyllables = function(find, callback){

    syllables.find(find, function(err,docs){
        if(err){
            return callback(err);
        }

        if(docs == []){
            return callback(new Error('Syllables not found'));
        }
        else{
            return callback(err,docs);
        }
    });

};


exports.setDefaultStats = function(uid, callback){

    var statsGame1 = {};
    statsGame1[uid] = {'best':0,'hiragana':{},'katakana':{}};

    users.collection.update({'_key':'uid:game1Stats'},{$set:statsGame1},{upsert:true},function(err){
        if(err){
            return callback(err);
        }
        else{
            callback(null);
        }
    });
}

exports.getGame1Stats = function(uid, callback){

    users.findOne({'_key': 'uid:game1Stats'},{'_id':0}).select(uid).exec(function(err,doc){
        if(err){
            return callback(err);
        }

        if(typeof doc !== 'undefined' || !doc || doc == 'null'){
            module.exports.setDefaultStats(uid, function(){});
            return callback(null,{'best':0,'hiragana':{},'katakana':{}});
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
