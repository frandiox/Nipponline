
fs = require('fs');

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