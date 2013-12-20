/**
 * Utils
 */
var Filesystem = require('fs'),
	Util = require('util');

/**
 * Loads a directory of files automatically and returns them based on their file name.
 * @param  String directory Absolute path of folder.
 * @param  String suffix    Suffix for files to load. If missing, don't load.
 * @param  String prefix    Prefix for files to load. If missing, don't load.
 * @return Object           required files.
 */
exports.loadDirectory = function(directory, suffix, prefix) {
	//Read the current directory filenames
	var folder = Filesystem.readdirSync(directory),
		exports = {},
		split,
		splitting,
		reference;

	//Loop directory contents and load modules
	folder.forEach(function(currentFile, index) {
		reference = false;
		/**
		 * Skip of index.js
		 */
		if (currentFile == 'index.js') {
			return;
		}

		splitting = currentFile;

		/**
		 * Split out Prefix, check and redo reference.
		 */
		if (prefix) {
			split = splitting.split(prefix);
			if (split[0] !== '') {
				return;
			}
			reference = splitting = split[1];
		}
		/**
		 * Split out Suffix, check and redo reference.
		 */
		if (suffix) {
			split = splitting.split(suffix);
			if (split[split.length - 1] !== '') {
				return;
			}
			reference = splitting = split[1];
		}
		/**
		 * Get the stat of the file for directory testing
		 * @type {object}
		 */
		var File = Filesystem.statSync(directory + "/" + currentFile);
		/**
		 * Skip if Directory
		 */
		if (File.isDirectory()) {
			return;
		}
		/**
		 * Default reference is the file without extension.
		 */
		if (!reference) {
			reference = currentFile.split('.')[0];
		}
		/**
		 * The File to be loaded.
		 * @type {object}
		 */
		var file = require(Filesystem.realpathSync(directory) + '/' + currentFile);
		exports[reference] = file;
	});
	return exports;
};
exports.loadDirectoryRecursive = function(path, obj) {
	var dir = Filesystem.readdirSync(path);
	for (var i = 0; i < dir.length; i++) {
		var name = dir[i];
		var target = path + '/' + name;

		var stats = Filesystem.statSync(target);
		if (stats.isFile()) {
			if (name.slice(-3) === '.js') {
				obj[name.slice(0, -3)] = require(target);
			}
		} else if (stats.isDirectory()) {
			obj[name] = {};
			exports.loadDirectoryRecursive(target, obj[name]);
		}
	}
};
exports.howLongAgo = function(date) {
	var now = new Date();
	var diff = now - date;

	var sec_diff = Math.floor(diff / 1000),
		min_diff = Math.floor(diff / 1000 / 60),
		hrs_diff = Math.floor(diff / 1000 / 60 / 60),
		days_diff = Math.floor(diff / 1000 / 60 / 60 / 24);

	if (sec_diff == 1) {
		return sec_diff + ' second';
	} else if (sec_diff < 60) {
		return sec_diff + ' seconds';
	} else if (min_diff == 1) {
		return min_diff + ' minute';
	} else if (min_diff < 60) {
		return min_diff + ' minutes';
	} else if (hrs_diff == 1) {
		return hrs_diff + ' hour';
	} else if (hrs_diff < 24) {
		return hrs_diff + ' hours';
	} else if (days_diff == 1) {
		return days_diff + ' day';
	} else {
		return days_diff + ' days';
	}
};
exports.hasProperties = function(obj, prop){
	if( typeof obj === 'object' 
		&& typeof prop === 'object' 
		&& Object.prototype.toString.call( obj ) !== '[object Array]'
		&& Object.prototype.toString.call( prop ) === '[object Array]'){
		for(var i in prop){
			if(!prop.hasOwnProperty(i)){
				return false;
			}
		}	
		return true;
	}
	return false;
};

exports.objectToArray = function(o, preserveKeys){	
	return Object.keys(o).map(function(a) {
		if(preserveKeys){
			return [o[a],a];
		} else {
			return o[a];
		}
	});
};
exports.log = function(obj){
	console.log( Util.inspect(obj, {showHidden: true, depth: null}) );
}