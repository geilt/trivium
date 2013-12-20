/**
 * Trivium System
 * Initializes the system and runs it.
 */
var config = require('../config'),
	utils = require('./utils'),
	fs = require('fs'),
	database = require('./database'),
	library = require('./library'),
	path = require('path'),
	Express = require('express'),
	http = require('http'),
	https = require('https'),
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
 * Load the System Controller
 * @type {[type]}
 */
var SystemController = new(require('./controller'))();

/**
 * System Object. For passing into various Functions.
 * @type {Object}
 */
var Models = utils.loadDirectory(path.resolve(__dirname, '../app/models'), '.model.js');

var SystemModel = new(require('./model'))(Models);

var system = {
	config: config,
	library: library,
	utils: utils,
	app: app,
	db: database,
	session: sessionStore,
	models: SystemModel
};

/**
 * Set Controller Objects.
 */
for (var obj in system) {
	SystemController.set(obj, system[obj]);
}

/**
 * Load the Controllers and Models
 */
var Controllers = utils.loadDirectory(path.resolve(__dirname, '../app/controllers'), '.controller.js');

/**
 * Loop through controllers.
 */
utils.objectToArray(Controllers, true).forEach(function(controller) {	
	/**
	 * Loops through actions and bind controller and actions to routes.
	 * main is always the root action if nothing is set. Main is also ignored.
	 */
	if ('actions' in controller[0]) {
		utils.objectToArray(controller[0].actions, true).forEach(function(action) {
			app.get( ( (action[1] !== 'main') ? '/' + controller[1] + '/' + action[1] : '/' + controller[1] ) , function(req, res) {
				SystemController.loadRoute(req, res, action[0], action[1]);
			});
		});
	}

	/**
	 * Runs init function if set. Useful for timers, timeouts and processes to run when the server starts up.
	 */
	if ('init' in controller[0] && typeof controller[0].init === 'function') {
		SystemController.loadInit(controller[0].init, controller[1]);
	}
});

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

/**
 * Start the Server in SSL mode or Normal Mode.
 */
if('ssl' in config.server && utils.hasProperties(config.server.ssl, ['key', 'cert'])){
	var SSLcredentials = {
		key: fs.readFileSync(config.server.ssl.key, 'utf8'),
		cert: fs.readFileSync(config.server.ssl.cert, 'utf8'),
		ca: [
			fs.readFileSync(config.server.ssl.ca, 'utf8')
		]
	};
	if('ca' in config.server.ssl){
		SSLcredentials.ca = [
			fs.readFileSync(config.server.ssl.ca, 'utf8')
		];
	}
	var server = https.createServer(SSLcredentials, app).listen(config.server.port);
} else {
	console.log('HTTP MODE');
	var server = http.createServer(app).listen(config.server.port);
}

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
	utils.objectToArray(Controllers, true).forEach(function(controller) {
		if('websockets' in controller[0]){
			utils.objectToArray(controller[0].websockets, true).forEach(function(websocket) {
				console.log('Socket', websocket);
				socket.on(controller[1] + '/' + websocket[1], function(data, response){
					console.log('Socket in Func', websocket);
					response( SocketController.loadSocket( data, websocket[0], websocket[1]) );
				});
			});
		}
	});
});

console.log('express and socket.io listening on port ' + config.server.port);