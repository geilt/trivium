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
	
	this.init = null;
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
Controller.prototype.model = function(model){
	return this.db.model[model];
}
Controller.prototype.loadRoute = function(req, res, controller, action, controllers){
	controllers[controller].actions[action](req, res, req.session);
};
Controller.prototype.loadSocket = function(data, controller, action, controllers){
	var response = controllers[controller].websockets[action](data, this.socket, this.session);
	this.session.save();
	return response;
}


module.exports = Controller;