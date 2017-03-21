var express = require("express");
var app = express();
var http = require("http");
var expressLess = require('express-less');
var SocketClient = require("socket.io-client");

var config = require("./config/");



// jade
app.set('view engine', 'jade');

// assets
app.use("/js/", express.static("./assets/js"));
app.use("/libs/", express.static("./assets/libs"));
app.use("/favicon.ico", express.static("./assets/img/favicon.ico"));
app.use("/logo.png", express.static(config.dsv.hostVerein.logoPath));

app.use("/css/", expressLess(__dirname + "/stylesheets"));

// main route
app.get("/", function(req, res){
	res.render("index.jade");
});


// express server init
var server = http.Server(app);
server.listen(config.network.port, config.network.address);
server.on("listening", function() {
	console.log("[INFO] DSV started (%s:%s)", server.address().address, server.address().port);
});


// socket init
var io = require("socket.io")(server);


// Redirect setData and onlineLines to client
var gatewaySocket = SocketClient(config.dscGateway.url);

// redirect setData from gateway to client
gatewaySocket.on("setData", function(data){
	io.emit("setData", data);
	if (onlineLines.lines[data.line] != null) {
		onlineLines.lines[data.line].cache.setData = data.data;
	}
});
gatewaySocket.on("setTeam", function(data){
	io.emit("setTeam", data);
	if (onlineLines.lines[data.line] != null) {
		onlineLines.lines[data.line].cache.setTeam = data.data;
	}
});

// redirect onlineLines from gateway to client
var onlineLines = {};
gatewaySocket.on("onlineLines", function(data){
	io.emit("onlineLines", data);
	onlineLines = data;
});

gatewaySocket.on("disconnect", function(){
	io.emit("onlineLines", {});
	onlineLines = {};
});


// send onlineLines to client new connected client
io.on("connection", function(socket){
	socket.emit("onlineLines", onlineLines);
});
