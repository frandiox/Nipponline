var //models_words = require('../app/models/words'),
    //syllables = models_words.words,
    //models_users = require('../app/models/users'),
    //users = models_users.users,
    fs = require('fs'),
    utils = require('../app/src/utils.js');

exports.index = function(req, res){
    fs.readFile('./public/html/game2.html', function (err, html) {
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