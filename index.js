var express = require("express")
var app = express()
var http = require("http")
var config = require("./config/")
var fs = require("fs")
var expressLess = require('express-less')



app.set('view engine', 'jade');


app.use("/js/", express.static("./assets/js"))
app.use("/libs/", express.static("./assets/libs"))

app.use("/css/", expressLess(__dirname + "/stylesheets"))

app.get("/", function(req, res){
	res.locals.config = {
		staende: config.staende,
	}
	res.render("index.jade")
})


var server = http.Server(app)
server.listen(config.network.port, config.network.address)
server.on("listening", function() {
	console.log("Express server started on at %s:%s", server.address().address, server.address().port)
})







var io = require("socket.io")(server)

io.on("connection", function (socket) {

	io.on("start", function (data) {
		console.log("New Client Connected");

	})

})




// var app = require('app');  // Module to control application life.
// var BrowserWindow = require('browser-window');  // Module to create native browser window.
//
// // Quit when all windows are closed.
// app.on('window-all-closed', function() {
// 	// On OS X it is common for applications and their menu bar
// 	// to stay active until the user quits explicitly with Cmd + Q
// 	if (process.platform != 'darwin') {
// 		app.quit();
// 	}
// });
//
// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// app.on('ready', function() {
// 	// Create the browser window.
// 	mainWindow = new BrowserWindow({width: 800, height: 600, "node-integration": false});
//
// 	// and load the index.html of the app.
// 	mainWindow.loadUrl('http://127.0.0.1:3000');
//
// 	// Open the devtools.
// 	mainWindow.openDevTools();
//
// 	// Emitted when the window is closed.
// 	mainWindow.on('closed', function() {
// 		// Dereference the window object, usually you would store windows
// 		// in an array if your app supports multi windows, this is the time
// 		// when you should delete the corresponding element.
// 		mainWindow = null;
// 	});
// });
