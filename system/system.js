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
	sessionStore = require('./session.js').sessionStore();

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
	//app.use(Express.logger()); /* 'default', 'short', 'tiny', 'dev' */
	app.use(Express.bodyParser());
	app.set('views', path.resolve(__dirname, '../app/views'));
	app.set('view engine', 'jade');
	app.use(stylus.middleware({
		src: path.resolve(__dirname, '../public'),
		compile: compile
	}));
	app.use(Express.bodyParser());
	app.use(Express.cookieParser());
	app.use(Express.session({
		store: sessionStore,
		secret: config.server.secret,
		key: config.server.key,
		cookie: {
			expires: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)),
			domain: '.' + config.server.domain
		}
	}));
	app.use(Express.static(path.resolve(__dirname, '../public')));
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
	app: app,
	db: database,
	session: sessionStore
};

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
			app.get('/' + controller, function(req, res){
				SystemController.loadRoute(req, res, controller, 'main', Controllers);
			});
		} else {
			app.get('/' + controller, SystemController.missing);
		}
		for (var action in Controllers[controller].actions) {
			if (action != 'main') {
				app.get('/' + controller + '/' + action, function(req, res) {
					SystemController.loadRoute(req, res, controller, action, Controllers);
				});
			}
		}
	}
	/**
	 * Runs init function if set. Useful for timers, timeouts and processes to run when the server starts up.
	 */
	if (Controllers[controller].hasOwnProperty('init')) {
		Controllers[controller].init.bind(SystemController)();
	}

	/**
	 * Redirect all others to 404
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]}     [description]
	 */
	app.all('*', function(req, res) {
	  res.status(404);
	  res.send('404');
	});
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

/**
 * Use Express Sessions to authorize the socket based on Express Cookie.
 */
io.set('authorization', function(data, callback) {
	if (!data.headers.cookie) {
		return callback('No cookie transmitted.', false);
	} else {
		data.cookie = cookie.parse(data.headers.cookie);
		data.sessionID = connect.utils.parseSignedCookie(data.cookie[config.server.key], config.server.secret);
		sessionStore.load(data.sessionID, function(err, session){
			if (err || !session) {
                callback(err, false);
            } else {
            	data.session = session;

                return callback(null, true);
            }
		});
	}
});
/**
 * Start Socket Connection
 */
io.sockets.on('connection', function(socket) {
	
	/**
	 * Join socket on Session ID to message this socket only.
	 */
	socket.join(socket.handshake.sessionID);
	
	/**
	 * Bind Socket to SystemController. We create a new controller per socket to keep peoples filthy hands off each others data.
	 */
	var SocketController = new(require('./controller'))();

	for (var obj in system) {
		SocketController.set(obj, system[obj]);
	}
	SocketController.set('socket', socket);
	/**
	 * We got Session from the authorization handshake.
	 */
	SocketController.set('session', socket.handshake.session);

	/**
	 * Loop through controllers and bind all websocket methods for this Socket.
	 */
	for (var controller in Controllers) {
		if (Controllers[controller].hasOwnProperty('websockets')) {
			for (var websocket in Controllers[controller].websockets) {
				socket.on(controller + '/' + websocket, function(data, response){
					response(SocketController.loadSocket(data, controller, websocket, Controllers));
				});
			}
		}
	}
});

console.log('express and socket.io listening on port ' + config.server.port);