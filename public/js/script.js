var socket = io.connect('http://triviumjs.com:11342');

$(document).on('ready', function(){
	socket.on('connect', function(){
	
	});
});

socket.on('sample/emit', function (data) {
});