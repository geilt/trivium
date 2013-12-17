trivium.js
=======

A Node Framework based on the concept that routes, web sockets and chronological events should be trivial.

Latest Version: `1.0`

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
	init: function() {
	
	}
	actions: {
		main: function(res, req) {
			//Default Action Route for a Controller (website.com/sample)
			res.render('sample', {
				title: 'Main Action'
			});
		},
		sample: function(res, req){
			//Action Route for a Controller (website.com/sample/sample)
			res.render('sample', {
				title: 'Sample Action'
			});
		}
	}, 
	websockets: {
		sample: function(data, send){
			//Action Websocket for a Controller ('sample/sample')
			res.render('sample', {
				title: 'Sample Action'
			});
		}
	}
};
```

Controllers have had the following values bound into them via a System Controller. The null values are replaced with system generated data at runtime.

```js
this.config = null;

this.mongoose = null;
this.mysql = null;
this.redis = null;

this.socket = null;
this.app = null;

this.library = null;
this.utils = null;

this.session = null;
```

### Init & Cron (Single Fire, Timed or Reoccuring Events)

You can place events that should be running persistently in the init function inside of each relevant controller. This will allow you to run "one time" blocks of code as well as use setTimeout or setInterval for processes that don't require user input. You can have an init on each controller and they will all run on load. This is a synchronous process as all inits are run in no particular order (May change in further versions).

```js
init: function(){
	//Do your stuff here.	
}
```

## Models

Folder: `/app/models/` File Naming Convention: `sample.model.js`

Models should include Schema declarations at the top of the file. By default, Trivium uses [Mongoose](https://github.com/learnboost/mongoose/) for Mongo and prefers to use Mongo for session data. For information on Mongoose Schemas the [Mongoose Documentation](http://mongoosejs.com/), please see (Further Revisions will open different automated session options based on config values present for redis and mySQL or use the filesytem if no database is present at all).

## Libraries

Folder: `/app/lib/` File Naming Convention: `sample/sample.js`

Libraries collect files in library folders as objects. The above example would be used in a controller as `this.library.sample.sample`

## Views

Folder: `/app/views/` File Naming Convention: `sample.jade`

Trivium uses [Jade](https://github.com/visionmedia/jade) templates to render views.

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