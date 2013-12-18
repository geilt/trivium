/**
 * Trivium Configuration.
 */

/**
 * General Server Config
 * @type {Object}
 */
exports.server = {
	port: 11342, // Your HTTP Server Port for Routes.
	domain: 'triviumjs.com', // Your Domain
	root: __dirname, //Needed for System to run. Resolved Path issues.
	secret: 'aspfnweovt234890pth9834hbt9w3', // Used for Sessions / Cookies
	key: 'trivium', // Used for Cookies
	session: 'mongo' //{mongo, mysql, memory, redis},
};
/**
 * MongoDB
 * Optional
 * @type {Object}
 */
exports.mongo = {
	db: 'trivium',
	host: 'localhost',
	port: 27017,  // optional, default: 27017
	options: {

	},
	name: 'Trivium'
};

/**
 * Redis Config
 * Optional
 * @type {Object}
 */
exports.redis = {
	port: '6379',
	host: '127.0.0.1',
	options: {}
};

/**
 * mySQL Config
 * Optional
 * @type {Object}
 */
exports.mysql = {
	host: 'localhost',
	user: 'geilt',
	password: 'blarg',
	database: 'geilt'
};

/**
 * Directory Configs
 * Optional
 * @type {Object}
 */
exports.directory = {

};

/**
 * Oauth Credentials for Social Network Goodness.
 * Optional
 * @type {Object}
 */
exports.oauth = {
	google: {
		"web": {
			"auth_uri": "https://accounts.google.com/o/oauth2/auth",
			"client_secret": "",
			"token_uri": "https://accounts.google.com/o/oauth2/token",
			"client_email": "",
			"redirect_uris": [""],
			"client_x509_cert_url": "",
			"client_id": "",
			"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
			"javascript_origins": [""]
		}
	}
};