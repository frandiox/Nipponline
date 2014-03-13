var session = require('../app/src/session.js');

module.exports = {
    login: function(req, res) {
        var message = 'hola';
        var body = '<div><p>' + message + '</p></div>';
        body = body + '<form action="/login" method="post">';
        body = body + '<div><label>Username:</label>';
        body = body + '<input type="text" name="username"/><br/></div>';
        body = body + '<div><label>Password:</label>';
        body = body + '<input type="password" name="password"/></div>';
        body = body + '<div><input type="submit" value="Submit"/></div></form>';
        res.send(body);
    },
    logout: function(req, res) {
        req.logout();
        res.redirect('/login');
    },
    auth: function(req, res){
        session.passport.authenticate('local', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/');
        }
    }
}