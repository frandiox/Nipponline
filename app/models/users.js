var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    nconf = require('nconf');

nconf.file('config.json');

var authForum = nconf.get('db:forum:user') && nconf.get('db:forum:pass') ? nconf.get('db:forum:user')+':'+nconf.get('db:forum:pass')+'@' : '';

var dbForum = mongoose.createConnection('mongodb://'+authForum+nconf.get('db:forum:location')+':'+nconf.get('db:forum:port')+'/'+nconf.get('db:forum:name'));

exports.users = dbForum.model('users',
    new Schema({}, { collection : 'objects'}));
