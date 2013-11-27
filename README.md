trivium.js
=======

A Node Framework based on the concept that routes, web sockets and chronological events should be trivial.

Latest Version: `1.0`

Trivium does all the configuration for you to run a basic web app with socket.io, express routes and even timed or one time / server start events. We do this by giving you a template by which to plan out your app. All you have to do is add the appropriate files and declarations and you are good to go! Trivium is great for front-end websites, back-end applications, API's and pretty much anything else.

## Server Requirements
### `NodeJS`, `NPM`, `MongoDB`
Trivium currently needs mongo to run it's sessions. Sessions running on mySQL / Redis are being considered for the future as well as running on a the filesystem. Trivium supports mySQL and Redis if there is a config for each available and will add the connections into every controller.

# Documentation
## Basics
The only files that you should be dealing with are those within `/app/`, `'/public/`, `package.json` and `config.js`. Everything else automatically configures itself based off of your file names and function names.

`/system` and `index.js` are required for the Framework to run. The framework references the previously mentioned folders.

## Controllers

Folder: `/app/controllers/` File Naming Convention: `yourcontroller.controller.js`

Controllers accept 3 different values that should be placed into exports for auto loading.
```js
//Controller mycontroller.controller.js
module.exports = {
	init: function() {
	
	}
	actions: {
		main: function() {
		//Default Route for a Controller (website.com/mycontroller)
		},
		add: function(){
		//Action Route for a Controller (website.com/mycontroller/add)
		}
	}, 
	websockets: {
		add: function(){
		//Action Websocket for a Controller ('mycontroller/add')
		}
	}
};
```
### Init & Cron

You can place your times events taht should be running consistenly in an init function inside of your controller. This will allow you to run "one time" blocks of code as well as setTimeout or setInterval code that doesn't require user input. You can have an init on each controller, they will all run. This is a synchronous process as all inits are run in no particular order.

```js
	init: function(){
		//Do your stuff here.	
	}
```
### Routes (Actions)


actions: {
	myfirstroute: 
Websockets

Actions

websockets: {}

init: function()

## Models

Folder: `/app/models/` File Naming Convention: `mymodel.model.js`

## Libraries

Folder: `/app/lib/` File Naming Convention: `mylib.js`

## Views

Folder: `/app/views/` File Naming Convention: `myview.jade`

## CSS

Folder: `/public/css/` File Naming Convention: `mystyle.styl`

## Images

Folder: `/public/img/`

Trivium uses stylus for CSS.


## JS


Models should be named: `mymodel.model.js`
