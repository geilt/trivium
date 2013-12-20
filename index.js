/**
 * initialize System Object
 */
var trivium = require('domain').create();
trivium.on('error', function(err) {
  // The error won't crash the process, but what it does is worse!
  // Though we've prevented abrupt process restarting, we are leaking
  // resources like crazy if this ever happens.
  // This is no better than process.on('uncaughtException')!
  console.log('Fatal Error: ', err.message, err.stack);
});

trivium.run(function() {
  var system = require('./system/system.js');
});