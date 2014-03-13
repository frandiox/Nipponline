var express = require('express'),
    i18n = require('i18next'),
    path = require('path'),
    nconf = require('nconf'),
    exphbs = require('express3-handlebars'),
    mongoose = require('mongoose'),
    session = require('./app/src/session'),
    socket = require('./app/src/socket'),
    routes = require('./app/routes'),
    app = express();

nconf.file('config.json');

i18n.init({
    saveMissing: true,
    debug: true,
    resGetPath: 'public/locales/__lng__/__ns__.json'
});


// all environments
app.configure(function(){
    app.set('port', process.env.PORT || 3300);
    app.set('views', __dirname + '/views');
    app.use('/', express.static(path.join(__dirname, 'public')));
    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        layoutsDir: app.get('views') + '/layouts'
    }));
    app.set('view engine', 'handlebars');
    app.use(i18n.handle);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        store: session.sessionStore,
        secret: nconf.get('sessionSecret'),
        key: 'express.sid',
        cookie: {
            maxAge: 60 * 60 * 24 * 30 * 1000
        }
    }));

    app.use(session.passport.initialize());
    app.use(session.passport.session());
    app.use(app.router);
    app.use(express.csrf());
});


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}



//finally boot up the server:
var server = app.listen(app.get('port'), function() {
    console.log('Server up: http://localhost:' + app.get('port'));
});
var io = require('socket.io').listen(server);

// Configuring sockets
socket.configure(io);

// This line allows for the use of i18n translation inside templates (.jade)
i18n.registerAppHelper(server);

//routes list:
routes.initialize(app);