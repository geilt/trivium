/**
 * Trivium Database
 * Loads Databases into Memory if they exist in Config.
 * TODO: Check if mySQL, Mongoose, Redis Configuration exists before even trying to load. SystemJS needs to modify itself for different sessions types based on whats available.
 */
var config = require('../config'),
	utils = require('./utils.js'),
	path = require("path");

/**
 * Load up Mongoose
 * @type {[type]}
 */
if(config.hasOwnProperty('mongo') && utils.hasProperties(config.mongo, ['db', 'host', 'port'])){
	var Mongoose = require("mongoose");
	
	/**
	 * Create the DSN for Connection
	 * @type {String}
	 */
	config.mongo.dsn = 'mongodb://' + config.mongo.host + ':'+ config.mongo.port + '/' + config.mongo.db;
	
	/**
	 * Load App Mongo Schemas
	 * @type {[type]}
	 */
	require('./utils.js').loadDirectory(path.resolve(__dirname,'../app/schemas'), '.schema.js');
	
	/**
	 * Load System Session Schema
	 */
	var mongooseSessionStore = require('./schemas/session.schema.js');
	
	/**
	 * Make the connection
	 */
	Mongoose.connect(config.mongo.dsn);

	module.exports.mongoose = Mongoose;
	
	module.exports.mongoose.sessionStore = mongooseSessionStore;
}

/**
 * Load up mySQL
 * @type {[type]}
 */
if(config.hasOwnProperty('mysql') && utils.hasProperties(config.mysql, ['host', 'user', 'password', 'database'])){
	var Mysql = require("mysql");
	/**
	 * Make the connection if we have all the config data
	 */
	Mysql.createConnection(config.mysql);
	/**
	 * Make sure connections get reconnected if they timeout.
	 */
	//utils.replaceClientOnDisconnect(Mysql);

	module.exports.mysql = Mysql;
}

/**
 * Load up Redis
 */
if(config.hasOwnProperty('redis') && utils.hasProperties(config.redis, ['host', 'port'])){
	var Redis = require("redis");
	/**
	 * Make the connection if we have all config data.
	 */
	Redis.createClient(config.redis.post, config.redis.host, config.redis.options);

	module.exports.redis = Redis;
}

/**
 * Load all app models
 */
module.exports.models = require('./utils.js').loadDirectory(path.resolve(__dirname,'../app/models'), '.model.js');