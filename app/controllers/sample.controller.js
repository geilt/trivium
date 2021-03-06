/**
 * Sample Controller
 * Init: Anything in init will run immediatly on server start. Put your timed events here.
 * Actions: Anything in Actions will run as a route based off the controller name. 
 * main is the default function run if no action is present. 
 * For example: /sample and sample/action are configured here.
 * Websockets: Anything in Websockets will automatically create a listener with the name of the file and the name of the websocket. 
 * For example: sample/sample is the event written here. You can emit things in these functions.
 * @type {Object}
 */
module.exports = {
	/**
	 * Runs on startup. 
	 * Put anything that has consistent time (cron) events for this controller here.
	 * Put anything that needs to run on server startup for this controller here.
	 * @return {void}
	 */
	init: function() {
		
	},
	actions: {
		/**
		 * The default action route /sample
		 * @param  {object} req http://expressjs.com/api.html#req.params
		 * @param  {object} res http://expressjs.com/api.html#res.status
		 * @return {void}     
		 */
		main: function(req, res, session) {
			res.render('sample', {
				title: 'Main Action',
				content: session.sample || ''
			});
		},
		/**
		 * An action route /sample/action
		 * @param  {object} req http://expressjs.com/api.html#req.params
		 * @param  {object} res http://expressjs.com/api.html#res.status
		 * @return {void}   
		 */
		sample: function(req, res, session){
			res.render('sample', {
				title: 'Sample Action',
				content: req.session.test || ''
			});
		}
	},
	websockets: {
		/**
		 * A Websocket Listener (sample/sample)	http://socket.io/#how-to-use
		 * @param  {object|array} data information recieved from the event. Usually an object
		 * @param  {callback} send a callback function to return to the event. Pass in an object if desired.
		 * @param  {session} the Session object. 
		 * @return {mixed} return values will be send back to the emmiting client.
		 */
		sample: function(data, socket, session) {
			var newSample = data.input + ' Sample';
			session.sample = newSample;
			socket.emit('sample/emit', newSample);
			return {'test': 'test'};
		}
	}
};