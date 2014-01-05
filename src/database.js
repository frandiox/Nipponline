var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/npl_jp');

var syllabes = mongoose.model('syllabes', 
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