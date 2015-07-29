var express = require("express")
var app = express()
var http = require("http")
var config = require("./config/")
var fs = require("fs")




app.set('view engine', 'jade');

app.get("/", function(req, res){
	res.render("index.jade")
})


var server = http.Server(app)
server.listen(config.network.port, config.network.address)
server.on("listening", function() {
	console.log("Express server started on at %s:%s", server.address().address, server.address().port)
})







var io = require("socket.io")(server)

io.on("connection", function (socket) {

	s.on("start", function (data) {
		console.log("New Client Connected");

	})

})
