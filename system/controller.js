/**
 * Trivium Controller Prototype/Class
 * Allows for setting of specific properties in Routes, Websockets and Init.
 */

/**
 * Constructor
 */
function Controller() {
	this.config 	= this.db 		= 
	this.socket 	= this.sockets	=
	this.library 	= this.utils 	=
	this.models 	= this.model 	=
	this.app 		= this.session 	= null;
}
/**
 * Setter
 * @param {String} name Property name
 * @param {Object} obj  An object
 */
Controller.prototype.set = function(name, obj) {
	if(this.hasOwnProperty(name)){
		this[name] = obj;
	}
};
/**
 * Getter
 * @param  {String} name Property name
 * @return {Mixed|null}      Property
 */
Controller.prototype.get = function(name){
	if(this.hasOwnProperty(name)){
		return this[name];
	}
	return null;
};
/**
 * Initialization / One Time Functions on Server Start
 * @param  {[Function|String]} controller object which contains the function to run and the name of the function.
 * @return {void}
 */
Controller.prototype.loadInit = function( controller ){
	if(controller[1] in this.models){
		this.model = this.models[controller[1]];
	}
	var req = {
		sockets: 		this.sockets,
		controller: 	controller[1],
		utils: 			this.utils,
		library: 		this.library,
		app: 			this.app,
		config: 		this.config,
		db: 			this.db,
		models: 		this.models,
		model: 			this.model
	}

	controller[0].init(req);
}
/**
 * Routes
 * @param  {Object}   req        Express request variable. We append our own data to this here instead of using Middleware (Ensures it happens)
 * @param  {Object}   res        Express response object. Use res.send() or res.render()
 * @param  {[Function|String]}   controller Controller object it's name.
 * @param  {[Function|String]}   action     Action function to run and it's name.
 * @return {void}              
 */
Controller.prototype.loadRoute = function(req, res, controller, action){
	if(controller in this.models){
		this.model = this.models[controller];
	}
	req.controller  = 	controller[1];
	req.action 		= 	action[1];
	req.utils 		=	this.utils;
	req.library 	=	this.library;
	req.app 		=	this.app;
	req.config 		=	this.config;
	req.db 			=	this.db;
	req.models 		=	this.models;
	req.model 		=	this.model;

	action[0](req, res);
};
/**
 * Websockets
 * @param  {mixed}   data       Data passed in from the client on socket.emit()
 * @param  {[Function|String]}   controller Controller object it's name.
 * @param  {[Function|String]}   websocket     Websocket function to run and it's name.
 * @param  {Function} callback   [description]
 * @return {void}
 */
Controller.prototype.loadSocket = function(data, controller, websocket, callback){
	if(controller in this.models){
		this.model = this.models[controller];
	}
	var req = {
		params: 		data || {},
		socket: 		this.socket,
		websocket: 		websocket[1],
		controller: 	controller[1],
		session: 		this.session,
		utils: 			this.utils,
		library: 		this.library,
		app: 			this.app,
		config: 		this.config,
		db: 			this.db,
		models: 		this.models,
		model: 			this.model
	}

	var res = {
		send: function(result){
			this.session.save();
			callback(result);
		}.bind(this)
	};

	websocket[0](req, res);
}

module.exports = Controller;