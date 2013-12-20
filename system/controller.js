/**
 * Trivium Controller
 * Allows for setting of specific properties in controllers.
 */
function Controller() {
	this.config = null;
	this.db = null;
	
	this.socket = null;
	this.app = null;

	this.library = null;
	this.utils = null;

	this.session = null;

	this.models = null;
	this.model = null;
}
Controller.prototype.set = function(name, obj) {
	if(this.hasOwnProperty(name)){
		this[name] = obj;
	}
};
Controller.prototype.get = function(name){
	if(this.hasOwnProperty(name)){
		return this[name];
	}
	return null;
};
Controller.prototype.missing = function(req, res){
	res.send('Missing Action');
};
Controller.prototype.loadInit = function(init, controller){
	if(controller in this.models){
		this.model = this.models[controller];
	}
	init.bind(this)();
}
Controller.prototype.loadRoute = function(req, res, action, controller){
	if(controller in this.models){
		this.model = this.models[controller];
	}
	action.bind(this)(req, res, req.session);
};
Controller.prototype.loadSocket = function(data, websocket, controller){
	if(controller in this.models){
		this.model = this.models[controller];
	}
	var response = websocket.bind(this)(data, this.socket, this.session);
	this.session.save();
	return response;	
}

module.exports = Controller;