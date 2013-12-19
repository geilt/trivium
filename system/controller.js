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
Controller.prototype.loadRoute = function(req, res, action){
	action(req, res, req.session);
};
Controller.prototype.loadSocket = function(data, websocket){
	var response = websocket(data, this.socket, this.session);
	this.session.save();
	return response;	
}

module.exports = Controller;