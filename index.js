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

app.use("/css/", expressLess(__dirname + "/stylesheets"))

// main route
app.get("/", function(req, res){
	res.locals.config = {
		lines: config.lines,
	}
	res.render("index.jade")
})


// express server init
var server = http.Server(app)
server.listen(config.network.port, config.network.address)
server.on("listening", function() {
	console.log("Express server started on at %s:%s", server.address().address, server.address().port)
})


// socket init
var io = require("socket.io")(server)
io.on("connection", function (socket) {

	io.on("start", function (data) {
		console.log("New Client Connected");

	})

})
