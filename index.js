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
	res.locals = {
		config: {
			dscGateway: {
				url: config.dscGateway.url,
			},
			dsv: {
				scaleFactor: config.dsv.scaleFactor,
			},
		},
	};
	res.render("index");
});


// express server init
var server = http.Server(app);
server.listen(config.network.port, config.network.address);
server.on("listening", function() {
	console.log("[INFO] DSV started (%s:%s)", server.address().address, server.address().port);
});
var io = require("socket.io")(server);
