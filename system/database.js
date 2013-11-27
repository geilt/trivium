/**
 * Trivium Database
 * Loads Databases into Memory if they exist in Config.
 * TODO: Check if mySQL, Mongoose, Redis Configuration exists before even trying to load. SystemJS needs to modify itself for different sessions types based on whats available.
 */
var config = require('../config'),
	Mongoose = require("mongoose"),
	Mysql = require("mysql"),
	Redis = require("redis"),
	path = require("path");
/**
 * Require System Session Schema
 */
require('./schemas/session.schema.js');
/**
 * Load all app models and schemas
 */
module.exports.models = require('./utils.js').loadDirectory(path.resolve(__dirname,'../app/models'), '.model.js');

/**
 * Export Mongoose with schemas
 */

module.exports.mysql = Mysql;
module.exports.redis = Redis;
module.exports.mongoose = Mongoose;
