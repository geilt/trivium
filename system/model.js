/**
 * Trivium Controller
 * Allows for setting of specific properties in controllers.
 */

var config = require('../config'),
	database = require('./database'),
	utils = require('./utils'),
	library = require('./library');

function Model(models) {
	for(model in models){
		this[model] 		= models[model];
		this[model].db 		= database;
		this[model].utils 	= utils;
		this[model].config 	= config;
		this[model].library = library;

		for( action in model ){
			if(typeof action === 'function'){
				this[model][action].bind(this);
			}
		}
	}
}
Model.prototype.set = function(name, obj) {
	if(this.hasOwnProperty(name)){
		this[name] = obj;
	}
};
Model.prototype.model = function(model, action, args){
	this.model[model][action].bind(this);
}
Model.prototype.get = function(name){
	if(this.hasOwnProperty(name)){
		return this[name];
	}
	return null;
};

module.exports = Model;