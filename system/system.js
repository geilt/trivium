/**
 * Trivium System
 * Initializes the system and runs it.
 */
var config = require('../config'),
	utils = require('./utils'),
	database = require('./database'),
	library = require('./library'),
	path = require('path'),
	Express = require('express'),
	http = require('http'),
	sio = require('socket.io'),
	stylus = require('stylus'),
	nib = require('nib'),
	connect = require('connect'),
	cookie = require('cookie'),
	router = require('./router');

/**
 * Connect to the Databases
 */
database.mongoose.connect(config.mongo.dsn);

/**
 * Start the app with Express!
 * @type {Express}
 */
var app = new Express();
/**
 * Setup Nib
 */

function compile(str, path) {
	return stylus(str)
		.set('filename', path)
		.use(nib());
}

app.configure(function() {
	/* Not Needed Anymore due to Binds.
	app.use(function(req, res, next) {
		//Dont have to pass the database around, it is now in every request in Express.
		this.session = req.session;
		next();
	});
	*/
	app.use(Express.logger()); /* 'default', 'short', 'tiny', 'dev' */
	app.use(Express.bodyParser());
	app.set('views', path.resolve(__dirname, '../app/views'));
	app.set('view engine', 'jade');
	app.use(stylus.middleware({
		src: path.resolve(__dirname, '../public'),
		compile: compile
	}));
	app.use(Express.static(path.resolve(__dirname, '../public')));
	app.use(Express.bodyParser());
	app.use(Express.cookieParser());
	app.use(Express.session({
		store: database.mongoose.model("Session"),
		secret: config.server.secret,
		key: config.server.key,
		cookie: {
			expires: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)),
			domain: '.' + config.server.domain
		}
	}));
	app.use(app.router);
});
/**
 * System Object. For passing into various Functions.
 * @type {Object}
 */
var system = {
	config: config,
	mongoose: database.mongoose,
	library: library,
	utils: utils,
	app: app
};
/**
 * Load mySQL if we have a Config
 */
if('mysql' in config){
	system.mysql = database.mysql.createConnection(config.mysql);
	utils.replaceClientOnDisconnect(system.mysql);
}
/**
 * Load Redis if we have a Config
 */
if('redis' in config){
	system.redis = database.redis.createClient(config.redis.post, config.redis.host, config.redis.options);
}
/**
 * Load the Controllers
 * @type {[type]}
 */
var SystemController = new(require('./controller'))();

/**
 * Set Controller Objects.
 */
for (var obj in system) {
	SystemController.set(obj, system[obj]);
}
var Controllers = utils.loadDirectory(path.resolve(__dirname, '../app/controllers'), '.controller.js');

/**
 * Loop through controllers.
 */
for (var controller in Controllers) {
	/**
	 * Loops through actions and bind controller and actions to routes.
	 * main is always the root action if nothing is set. Main is also ignored.
	 */
	if (Controllers[controller].hasOwnProperty('actions')) {
		if (Controllers[controller].actions.hasOwnProperty('main')) {
			app.get('/' + controller, Controllers[controller].actions.main.bind(SystemController));
		} else {
			app.get('/' + controller, SystemController.missing);
		}
		for (var action in Controllers[controller].actions) {
			if (action != 'main') {
				app.get('/' + controller + '/' + action, Controllers[controller].actions[action].bind(SystemController));
			}
		}
	}
	/**
	 * Runs init function if set. Useful for timers, timeouts and processes to run when the server starts up.
	 */
	if (Controllers[controller].hasOwnProperty('init')) {
		Controllers[controller].init.bind(SystemController)();
	}
}

var server = http.createServer(app).listen(config.server.port);

var io = sio.listen(server, {
	log: true
});
/**
 * Express Cookie authorizations for Sockets
 */

io.enable('browser client minification'); // send minified client
//io.enable('browser client etag'); // apply etag caching logic based on version number
//io.enable('browser client gzip'); // gzip the file
//io.set('log level', 1);
io.set('transports', [
	'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'
]);

io.set('authorization', function(data, accept) {
	if (data.headers.cookie) {
		data.cookie = cookie.parse(data.headers.cookie);
		data.sessionID = connect.utils.parseSignedCookie(data.cookie[config.server.key], config.server.secret);
		
		var Session = database.mongoose.model("Session").findById(data.sessionID, function(err, session){
			if (err) {
				// if we cannot grab a session, turn down the connection
				accept(err.message, false);
			} else {
				//data.session = session;
				data.session = session;
				accept(null, true);
			}
		});
		//var sess = new Session();
		
		/*database.mongoose.model("Session").get(data.sessionID, function(err, session) {
			if (err) {
				// if we cannot grab a session, turn down the connection
				accept(err.message, false);
			} else {
				//data.session = session;
				data.session = new database.model("Session").Session(data, session);
				accept(null, true);
			}
		});
		*/
		/*
		database.mongoose.model("Session").get(data.sessionID, function(err, session) {
			if (err || !session) {
				accept('Error', false);
			} else {
				// create a session object, passing data as request and our
				// just acquired session data
				data.session = new connect.middleware.session.Session(data, session);
				accept(null, true);
			}
		});
*/
	} else {
		return accept('No cookie transmitted.', false);
	}
});
/**
 * Start Sockets
 */
io.sockets.on('connection', function(socket) {
	socket.join(socket.handshake.sessionID);
	/**
	 * Bind Socket to SystemController
	 */

	var SocketController = new(require('./controller'))();
	for (var obj in system) {
		SocketController.set(obj, system[obj]);
	}
	SocketController.set('socket', socket);
	/**
	 * Get session data and pass it to IO.
	 * @param  {[type]} error   [description]
	 * @param  {[type]} session [description]
	 * @return {[type]}         [description]
	 */

	if(socket.handshake.session) {
		SocketController.set('session', socket.handshake.session);
	}

	/**
	 * Loop through controllers and bind all websocket methods.
	 */
	for (var controller in Controllers) {
		if (Controllers[controller].hasOwnProperty('websockets')) {
			for (var websocket in Controllers[controller].websockets) {
				socket.on(controller + '/' + websocket, Controllers[controller].websockets[websocket].bind(SocketController));
			}
		}
	}
});

console.log('Listening on port ' + config.server.port);