var config = require('../config'),
	Express = require('express'),
	database = require('./database');

module.exports.sessionStore = function() {
	/**
	 * Default to Memory Sessions.
	 */
	if (!config.server.hasOwnProperty('session')) {
		config.server.session = 'memory';
	}
	switch (config.server.session) {
		case 'mongo':
		case 'mongoose':
			return database.mongoose.model('Sessions');
			break;
		case 'mysql':
			break;
		case 'redis':
			return new RedisStore({
				host: 'localhost',
				port: 6379,
				db: 2,
				pass: 'RedisPASS'
			});
			break;
		default:
			return new Express.session.MemoryStore();
			break;
	}
};