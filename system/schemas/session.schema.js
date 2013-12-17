/**
 * Mongoose Schema for Express Sessions. Modified.
 * @author  Robert Pitt @robertpitt
 * @contributor Alexander Conroy @geilt
 * @see https://github.com/robertpitt/blog/blob/master/system/models/session.js
 * Changed to use _id instead of sid. Changed to use expires instead of _expires. Removed id from the update data.
 */
var Mongoose = require('mongoose'),
    _Store = require('express').session.Store;

var Session = new Mongoose.Schema({
	_id: {
		type: String,
		required: true,
		unique: true
	},
	expires: {
		type: Date,
		required: true
	},
	session: {
		type: Object,
		required: false,
		default: {}
	}
});

/**
 * Set or update a session to MongoDB
 * @param {String}   sid      Session Identifier
 * @param {Object}   session  New session data
 * @param {Function} callback callback for completion
 */
Session.statics.set = function(sid, session, callback) {
    try {
        var newSession = {
            session: session
        };

        /**
         * Update the session expiry time
         */
        if (session && session.cookie && session.cookie.expires) {
            newSession.expires = session.cookie.expires;
        }
        /**
         * Update/insert the session
         */
        this.update({
            _id: sid
        }, newSession, {
            upsert: true
        }, function(err, data) {
            callback && callback(err || null);
        });
    } catch (err) {
        callback && callback(err);
    }
};

/**
 * Return a session object from the storage
 * @param  {String}   sid      Session Identifer
 * @param  {Function} callback Callback upon completion
 */
Session.statics.get = function(sid, callback) {
    /**
     * create a scoped reference to the local object
     */
    var self = this;
    /**
     * Find the session from the database
     */
    this.findOne({
        _id: sid
    }, function(err, result) {

        if (err) {
            callback && callback(err, null);
            return;
        }
        try {
            /**
             * If we have a result, parse the session and send it back.
             */
            if (result) {
                if (!result.expires || new Date() < result.expires) {
                    callback(null, result.session);
                    return;
                }
                /**
                 * Otherwise destroy the session because it is expired.
                 */
                self.destroy(sid, callback);
                return;
            }
            callback && callback(null, null);
        } catch (e) {
            callback && callback(e);
        }
    });
};

/**
 * Destroy and individual session
 * @param  {[type]}   sid      Session Identifier
 * @param  {Function} callback ..
 */
Session.statics.destroy = function(sid, callback) {
    this.remove({
        _id: sid
    }, function() {
        callback && callback(null, null);
    });
};

/**
 * Delete all session for the database
 * @param  {Function} callback ..
 */
Session.statics.clear = function(callback) {
    /**
     * Pass the callback to the drop method of the collection
     */
    this.drop(callback);
};

/**
 * Returns the count of sessions within the store
 * @param  {Function} callback callled when process is completed
 */
Session.statics.length = function(callback) {
    collection.count({}, callback);
};

Session.statics.getCollection = function() {
    return collection;
};

/**
 * Re-generate the given requests's session.
 *
 * @param {IncomingRequest} req
 * @return {Function} fn
 * @api public
 */

/*Session.statics.regenerate = function(req, fn){
  var self = this;
  this.destroy(req.sessionID, function(err){
    self.generate(req);
    fn(err);
  });
};*/
/**
 * Load a `Session` instance via the given `sid`
 * and invoke the callback `fn(err, sess)`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */

Session.statics.load = function(sid, fn){
  var self = this;
  this.get(sid, function(err, sess){
    if (err) return fn(err);
    if (!sess) return fn();
    var req = { sessionID: sid, sessionStore: self };
    sess = self.createSession(req, sess);
    fn(null, sess);
  });
};

/**
 * Create session from JSON `sess` data.
 *
 * @param {IncomingRequest} req
 * @param {Object} sess
 * @return {Session}
 * @api private
 */

/*Session.statics.createSession = function(req, sess){
  var expires = sess.cookie.expires
    , orig = sess.cookie.originalMaxAge;
  sess.cookie = new Cookie(sess.cookie);
  if ('string' == typeof expires) sess.cookie.expires = new Date(expires);
  sess.cookie.originalMaxAge = orig;
  req.session = new Session(req, sess);
  return req.session;
};*/
/**
 * Get the collection
 *
 * @param
 * @api public
 */
Session.statics.createSession = _Store.prototype.createSession.bind(_Store.Store);
//Session.statics.load = _Store.prototype.load.bind(_Store.Store);
Session.statics.regenerate = _Store.prototype.regenerate.bind(_Store.Store);

//export the model
module.exports = Mongoose.model("Sessions", Session);
