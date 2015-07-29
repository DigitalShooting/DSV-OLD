/* -----------------------------------
 * Scheibenanzeige für Häring ESA
 * 
 * /public/main.js (JS Client)
 *
 * (c) 2014 Jannik Lorenz
 * ----------------------------------- */


/* --- linien (Array) --- */
var linien = new Array();



$(function() {
	var $window = $(window); 
	var socket = io();
	
	socket.emit('start', "hallo");
	socket.on('change', function (data) {
		console.log(data.filename);
		var parser = new Parser(data);
  		
  	});
});



window.onload = function() {
	
	$('.linie').each(function(index){
		var id = $(this).attr("id");
		var linie = new Linie(id);
		linien[id] = linie;
	});
	
}


