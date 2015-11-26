var express = require("express")
var app = express()
var http = require("http")
var config = require("./config/")
var fs = require("fs")
var expressLess = require('express-less')

// jade
app.set('view engine', 'jade');

// assets
app.use("/js/", express.static("./assets/js"))
app.use("/libs/", express.static("./assets/libs"))
app.use("/favicon.ico", express.static("./assets/img/favicon.ico"))

app.use("/css/", expressLess(__dirname + "/stylesheets"))

// main route
app.get("/", function(req, res){
	res.locals = {
		dscGatewayUrl: config.dscGateway.address + ":" + config.dscGateway.port,
	}
	res.render("index.jade")
})


// express server init
var server = http.Server(app)
server.listen(config.network.port, config.network.address)
server.on("listening", function() {
	console.log("[INFO] DSV started (%s:%s)", server.address().address, server.address().port)
})


// socket init
var io = require("socket.io")(server)
