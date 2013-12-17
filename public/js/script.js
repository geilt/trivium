var socket = io.connect('http://triviumjs.com:11342');

$(document).on('ready', function(){
	socket.on('connect', function(){
		$(document).on('click', '.sample-button', function() {
			socket.emit('sample/sample', { 
				input: $('.sample-text').val() 
			}, function(data){
				console.log(data);
			});	
		});
	});
});

socket.on('sample/emit', function (data) {
	console.log('Emit', data);
});