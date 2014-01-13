var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    nconf = require('nconf');

nconf.file('config.json');

var authLang = nconf.get('db_lang:user') && nconf.get('db_lang:pass') ? nconf.get('db_lang:user')+':'+nconf.get('db_lang:pass')+'@' : '',
    authForum = nconf.get('db_forum:user') && nconf.get('db_forum:pass') ? nconf.get('db_forum:user')+':'+nconf.get('db_forum:pass')+'@' : '';

var dbLang = mongoose.createConnection('mongodb://'+authLang+nconf.get('db_lang:location')+':'+nconf.get('db_lang:port')+'/'+nconf.get('db_lang:name')),
    dbForum = mongoose.createConnection('mongodb://'+authForum+nconf.get('db_forum:location')+':'+nconf.get('db_forum:port')+'/'+nconf.get('db_forum:name'));

var syllabes = dbLang.model('syllabes', 
  new Schema({ id: Number,
                romaji: String,
                hiragana: String,
                katakana: String,
                route: String,
                row: String,
                column: String,
                dakuten: String,
                handakuten: String,
                youon: Boolean,
                special: String,
                obsolete: Boolean},
  { collection : 'syllabes' }));

exports.getSyllabes = function(find, callback){

  syllabes.find(find, function(err,docs){
    callback(err,docs);
  });

};