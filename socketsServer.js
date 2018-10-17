var server = require('http').createServer(app);
io = require('socket.io')(server);
io.on('connection', function(client){
	console.log("new socket connected")
	client.on('event', function(data){});
	client.on('disconnect', function(){});
});
server.listen(3000);