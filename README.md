trivium.js
=======

A Node Framework based on the concept that routes, web sockets and chronological events should be trivial.

Latest Version: `1.5`

Trivium does all the configuration for you to run a basic web app with socket.io, express routes and even timed or one time / server start events. We do this by giving you a template by which to plan out your app. All you have to do is add the appropriate files and declarations and you are good to go! Trivium is great for front-end websites, back-end applications, API's and pretty much anything else.

## Server Requirements
### `NodeJS`, `NPM`, `MongoDB` *Optional `Redis`, `mySQL`
Trivium currently needs mongo to run it's sessions. Sessions running on mySQL / Redis are being considered for the future as well as running on a the filesystem. Trivium supports mySQL and Redis if there is a config for each available and will add the connections into every controller.

## Installation
1. Clone the repo `git clone git@github.com:geilt/trivium.git`
2. Run `npm install`
3. Modify `config.js` with your server information. Make sure to go over all of it. Optional sections are marked.
4. Run `node index.js`
5. Start Modifying files in `/app` and `/public`. Follow the pattern set by the Sample App. Instructions are included in the sample files. You can delete them when you are ready. 

# Documentation
## Basics
The only files that you should be dealing with are those within `/app/`, `'/public/`, `package.json` and `config.js`. Everything else automatically configures itself based off of your file names and function names.

`/system` and `index.js` are required for the Framework to run. The framework references the previously mentioned folders.

## Controllers

Folder: `/app/controllers/` File Naming Convention: `yourcontroller.controller.js`

Trivium uses automaticallty configured [Express](https://github.com/visionmedia/express) routes based on the file names of the controller and the object names within. It uses a similar approach with [Socket.io](https://github.com/learnboost/socket.io/), the only difference being that there is no default (main) websocket as there is a default(main) Express route.

Controllers accept 3 different values that should be placed into exports for auto loading. More information can be found in the included sample controller found at `/app/controllers/sample.controller.js`.

```js
//Controller sample.controller.js
module.exports = {
	init: function(req) {
		//Do some Stuff here!
	}
	actions: {
		main: function(req, res) {
			//Default Action Route for a Controller (website.com/sample)
			res.render('sample', {
				title: 'Main Action'
			});
		},
		sample: function(req, res){
			//Action Route for a Controller (website.com/sample/sample)
			res.render('sample', {
				title: 'Sample Action'
			});
		}
	}, 
	websockets: {
		sample: function(req, res){
			//Action Websocket for a Controller ('/sample/sample')
			return {
				'result': true
			};
		}
	}
};
```

### Init & Cron (Single Fire, Timed or Reoccuring Events)

You can place events that should be running persistently in the init function inside of each relevant controller. This will allow you to run "one time" blocks of code as well as use setTimeout or setInterval for processes that don't require user input. You can have an init on each controller and they will all run on load. This is a synchronous process as all inits are run in no particular order.

```js
init: function(res){
	//Do your stuff here.	
}
```
We mimic our Express and Websockets requests `req` object to maintain standards. Init has no response `res` object.

```js
var req = {
	sockets: 		this.sockets,
	controller: 	controller[1],
	utils: 			this.utils,
	library: 		this.library,
	app: 			this.app,
	config: 		this.config,
	db: 			this.db,
	models: 		this.models,
	model: 			this.model
}
```
### Routes (Actions)

Routes work like standard Express routes. If there are no actions in a controller it won't load any routes. Route format looks like this `/:controllerFileName/:actionFunctionName`. Setting a "main" action will bind `/:controllerFileName` to that action.

We bind some extra fields into Expresses request `req` before running our function. This makes sure this critical system data gets to the Controller function.
```js
req.controller  = 	controller[1];
req.action 		= 	action[1];
req.utils 		=	this.utils;
req.library 	=	this.library;
req.app 		=	this.app;
req.config 		=	this.config;
req.db 			=	this.db;
req.models 		=	this.models;
req.model 		=	this.model;
```

### Websockets

Trivium automatically creates websocket listeners in the following format mirroring Express routes `/:controllerFileName/:websocketFunctionName`. Use res.send() inside your websocket function to return data back to socket.io. if your need to respond to an emit().

The following are the extra parameters set for requests `req` from our master Controller.
```js
var req = {
	params: 		data || {},
	socket: 		this.socket,
	websocket: 		websocket[1],
	controller: 	controller[1],
	session: 		this.session,
	utils: 			this.utils,
	library: 		this.library,
	app: 			this.app,
	config: 		this.config,
	db: 			this.db,
	models: 		this.models,
	model: 			this.model
}
```
We also include our own response `res` object with a send method to mimic Express.
```js
var res = {
	send: function(result){
		this.session.save();
		callback(result);
	}.bind(this)
};
```
## Models

Folder: `/app/models/` File Naming Convention: `sample.model.js`

Trivium will auto load models into each Controller request for init, action and websocket requests `req` as `req.models.modelName`. This created a standard among all 3 tasks and functionstypes. If it finds a model with the same name as the Controller then it will set it to `req.model` in the controller. You can call a model function with `req.model.modelFunction()` Otherwise use `req.models.modelName.modelFunction()` to run any other model function. You can also set values to your exports in a model and access them with `req.model.modelVar` or `this.models.modelName.modelVar`. 

These are the extra variables available in each model. Each model function also has this data bound to it's scope automatically
```js
this.models
this.db
this.utils
this.config
this.library
```

## Schemas

Folder: `/app/schemas/` File Naming Convention: `sample.schema.js`

If you are using Mongo/Mongoose you can drop any schema into the schema folder and it will be auto loaded if you have valid and working Mongo Credentials.

## Libraries

Folder: `/app/lib/` File Naming Convention: `sample/sample.js`

Libraries collect files in library folders as objects. The above example would be used in a controller as `this.library.sample.sample`

## Views

Folder: `/app/views/` File Naming Convention: `sample.jade`

Trivium uses [Jade](https://github.com/visionmedia/jade) templates to render views.

## Sessions

By default Trivium uses the Memory Store for Sessions if nothing is configured. Trivium can use [Mongoose](https://github.com/learnboost/mongoose/) for Mongo Sessions, Redis or mySQL Sessions. For information on Mongoose Schemas see [Mongoose Documentation](http://mongoosejs.com/).

Sessions work both in Routes Actions and Websocket Actions. The Websocket session hooks into the Express Session store, so Express and Socket.io share the same session for authorization and session manipulation. 

## CSS

Folder: `/public/css/` File Naming Convention: `style.styl`

Trivium uses [Stylus](https://github.com/learnboost/stylus). with [Nib](https://github.com/visionmedia/nib) for CSS.

You can organize the CSS folder however you want. Files will show up as `website.com/css/style.css`. When you create a .styl file, the .css will automatically be generated when the server starts and put into the same folder as the file you created. Stylus monitors the `/public/css` folder for files to interpret before the system runs. It will catch the .css request and create it if there is a .styl file available of the same name. 

## Images

Folder: `/public/img/`

You can organize the image folder however you want. Files will show up as `website.com/img/image.jpg`

## JavaScript

Folder: `/public/js/`

You can organize the JS folder however you want. Files will show up as `website.com/js/script.js`

If you want to use sockets you must include the following socket command. Be sure to to correct the domain and port you are connecting to. More information can be found in the [Socket.io Documentation](http://socket.io/#how-to-use)

```js
var socket = io.connect('http://website.com:11342');
```