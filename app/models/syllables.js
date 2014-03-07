var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    nconf = require('nconf');

nconf.file('config.json');

var authLang = nconf.get('db:lang:user') && nconf.get('db:lang:pass') ? nconf.get('db:lang:user')+':'+nconf.get('db:lang:pass')+'@' : '';

var dbLang = mongoose.createConnection('mongodb://'+authLang+nconf.get('db:lang:location')+':'+nconf.get('db:lang:port')+'/'+nconf.get('db:lang:name'));

exports.syllables = dbLang.model('syllables',
    new Schema({}, { collection : 'syllables' }));
