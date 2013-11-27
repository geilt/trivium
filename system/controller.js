/**
 * Trivium Controller
 * Allows for setting of specific properties in controllers.
 */
function Controller() {
	this.config = null;

	this.mongoose = null;
	this.mysql = null;
	this.redis = null;
	
	this.socket = null;
	this.app = null;

	this.library = null;
	this.utils = null;
	
	this.session = null;
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

module.exports = Controller;