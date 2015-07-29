/* -----------------------------------
 * Scheibenanzeige für Häring ESA
 *
 * index.js (NodeJS Server)
 *
 * (c) 2014 Jannik Lorenz
 * ----------------------------------- */


// --- Setup basic express server ---
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var socket;
var fs = require('fs');

// --- PORT ---
var port = process.env.PORT || 3000;

// --- Path ---
var HSABasePath = "/Users/firebug/Desktop/";

// --- Start Server and Route ---
server.listen(port, function () { console.log('Server listening at port %d', port); });
app.use(express.static(__dirname + '/public'));




/* -------------------------------------- */
/* ------------ Watch Folder ------------ */

fs.watch(HSABasePath, function (event, filename) {
    if (filename.substring(0,11) == "AktV02HES1L") {
        console.log('filename provided: ' + filename);
        var value;
        fs.readFile(HSABasePath+filename, 'utf8', function (err,data) {
			if (socket) {
	        	socket.emit('change', {
      				filename: filename,
	  				value: data
	  			});
	  		}
		});
    }
});

/* -------------------------------------- */
/* -------------------------------------- */







/* -------------------------------------- */
/* ---------- Manual Filescan ----------- */

function loadHSA() {
	fs.readdir(HSABasePath,function(err,files){
	    if (err) throw err;
	    files.forEach(function(filename){
			if (filename.substring(0,11) == "AktV02HES1L") {
			    console.log('filename provided: ' + filename);
			    var value;
			    fs.readFile(HSABasePath+filename, 'utf8', function (err,data) {
			    	if (socket) {
			    		socket.emit('change', {
			    			filename: filename,
			    			value: data
			    		});
			    	}
			    });
			}
	    });
	});
}

/* -------------------------------------- */
/* -------------------------------------- */








/* -------------------------------------- */
/* ------------- Socket IO -------------- */

io.on('connection', function (s) {
	s.on('start', function (data) {
    	socket = s;
    	console.log("New Client Connected");
    	loadHSA();
	});
});

/* -------------------------------------- */
/* -------------------------------------- */
