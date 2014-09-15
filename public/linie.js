/* -----------------------------------
 * Scheibenanzeige für Häring ESA
 * 
 * /public/linie.js (Linie Object)
 *
 * (c) 2014 Jannik Lorenz
 * ----------------------------------- */
 
 
function Linie(stand) {
	this.shoots = new Array();
	this.stand = stand;
	this.gesamt = 0;
	this.type = "";
	this.mode = 0; // 0=Probe, 1=Match
	this.paper = new Raphael(document.getElementById( "l"+this.stand ), 370, 370);
	this.drawPaper();
	this.indicator;
}

/* --- Add New Shot --- */
Linie.prototype.addNewShot = function(shoots) {
	
	
	// --- Clear ---
	for (var i = 0; i < this.shoots.length; i++) {
	   	var shot = this.shoots[i];
	   	if (shot.graph) shot.graph.hide();	
	}
	this.shoots = new Array();
	this.gesamt = 0;
	// -------------
	
	
	
	// --- Add To List ---
	for (var i = 0; this.shoots.length < shoots.length; i++) {
		this.shoots.push(shoots[i]);
	}
	// -------------------
	
	
	// --- Set GUI ---
	this.setGUI();
	
	// --- Calc Gesamt ---
	this.setGesamt();
	
	// --- Calc Serien ---
	this.setSerien();
	
	// --- Set Anzahl ---
	this.setAnzahl();
	
	// --- Set Nummer ---
	this.setNummer();
	
	// --- Set Last ---
	this.setLast();
}


/* --- Set GUI --- */
Linie.prototype.setGUI = function() {
	var start = (this.shoots.length-this.shoots.length%10);
	if (start == this.shoots.length && start > 0) start = start - 10; 
	for (var i = start; i < this.shoots.length; i++) {
		var shot = this.shoots[i];
	    
	    var lg = 12.56281407;
	    var lp = 43.243243243;
	    
	    if (i+1 == this.shoots.length) {	// Set Last Shot
	    	if (this.type == "Luftgewehr") shot.graph = this.paper.circle(185+(shot.x/lg), 185-(shot.y/lg), 9, 9 );
	    	else if (this.type == "Luftpistole") shot.graph = this.paper.circle(185+(shot.x/lp), 185-(shot.y/lp), 3, 3 );
	    	shot.graph.attr({ fill: '#f00', stroke: '#fff' });
	    	shot.graph.animate({"transform": "s2"}, 300, "linear");
	    	
	    	// Scale
	    	var shootint = parseInt(shot.value.substr(1, shot.value.length-1));
	    	var factor = 1
	    	if (shootint > 8) factor = 3;
	    	else if (shootint > 6) factor = 2;
	    	this.setMode(factor);
	    	$("#"+this.stand + " .scheibe").css({"transform":"scale("+factor+")"});
	    	
	    }
	    else { // Set Old Shot
	    	if (this.type == "Luftgewehr") shot.graph = this.paper.path("M " + (185+(shot.x/lg)-18) + " " + (185-(shot.y/lg)-0) + " l 18 0 l 0 -18  l 0 18 l 18 0 l -18 0 l 0 18 l 0 -18").attr({ fill: '#0f0', stroke: '#0f0', 'stroke-width': 1 });
	    	else if (this.type == "Luftpistole") shot.graph = this.paper.path("M " + (185+(shot.x/lp)-4) + " " + (185-(shot.y/lp)-0) + " l 4 0 l 0 -4  l 0 4 l 4 0 l -4 0 l 0 4 l 0 -4").attr({ fill: '#0f0', stroke: '#0f0', 'stroke-width': 0.8 });
	    }
	}
}


/* --- Set Name --- */
Linie.prototype.setName = function(name) {
	
	var b1 = name.search("!");
	if (b1 > 0) {
		var v1 = name.substring(b1+1, name.length);
		var b2 = v1.search("!");
		console.log(v1);
		$("#"+this.stand + " .name").html(name.substring(0, b1-1));
		$("#"+this.stand + " .team").html(v1);
	}
	else {
		$("#"+this.stand + " .name").html(name);
		$("#"+this.stand + " .team").html("");
	}
}


/* --- Set Gesamt --- */
Linie.prototype.setGesamt = function() {
	for (var i=0; i<this.shoots.length; i++) {
		var shot = this.shoots[i];
		this.gesamt = this.gesamt + parseInt(shot.value.substr(1, shot.value.length-1));
	}
	var title = "Ring";
	if (this.gesamt > 1) title = "Ringe";
	$("#"+this.stand + " .gesamt").html(this.gesamt+" "+title);
}


/* --- Set Anzahl --- */
Linie.prototype.setAnzahl = function() {
	$("#"+this.stand + " .anzahl").html(this.shoots.length);
}


/* --- Set Nummer --- */
Linie.prototype.setNummer = function() {
	$("#"+this.stand + " .nummer").html(this.stand.substring(1, this.stand.length));
}


/* --- Set Last --- */
Linie.prototype.setLast = function() {
	var shot = this.shoots[this.shoots.length-1];
	var v = shot.value.substr(1, shot.value.length-3);
	var title = "Ring";
	if (parseFloat(v) > 1) title = "Ringe";
	$("#"+this.stand + " .last").html(v+" "+title);
}


/* --- Set Serien --- */
Linie.prototype.setSerien = function() {
	var serien = new Array();
	for (var i=0; i<this.shoots.length; i++) {
		var shot = this.shoots[i];
		
		var start = (i-i%10)/10;
		if (i%10 == 0) serien[start] = 0;
		serien[start] = serien[start] + parseInt(shot.value.substr(1, shot.value.length-1));
	}
	var serienHtml = "";
	for (var i = 0; i<serien.length; i++) {
		var color = "000;";
		
		
		
		if (this.shoots.length%10 != 0 && i+1 == serien.length) color = "666;text-decoration: underline;";
		else {
			
			// Get Best
			// Get Worst
			
		}
		serienHtml += "<td style='color:#"+color+"'>"+serien[i]+"</td>";
	}
	$("#"+this.stand + " .serien tr").html(serienHtml);
}


/* --- Set Mode --- */
Linie.prototype.setMode = function(scale) {
	
	if (this.indicator != null) this.indicator.hide();
	if (this.mode == 0) {
		if (scale == 2) this.indicator = this.paper.path("M " + 227 + " " + 94 + " l 50 0 l 0 50").attr({ fill: '#0f0', stroke: '#0f0', 'stroke-width': 2 });
		else if (scale == 3) this.indicator = this.paper.path("M " + 213 + " " + 125 + " l 33 0 l 0 33").attr({ fill: '#0f0', stroke: '#0f0', 'stroke-width': 2 });
		else this.indicator = this.paper.path("M " + 270 + " " + 0 + " l 100 0 l 0 100").attr({ fill: '#0f0', stroke: '#0f0', 'stroke-width': 2 });
	}
}


/* --- Draw Paper --- */
Linie.prototype.drawPaper = function() {
   	console.log(this.type);
   	if (this.type == "Luftgewehr") {
	   	
	   	for(var i = 9; i >= 0; i--) {
  	 	    var line = this.paper.circle(185, 185, 1+20*i, 1+20*i );
  	 	    if(i>6) line.attr({ fill: '#fff', stroke: '#000' });
  	 	    else line.attr({ fill: '#000', stroke: '#fff' });
  	 	}
  	 	
  	 	for (var i = 9; i >= 0; i--) {
  	 	    if(i>0 && i<9) {
  	 	        var tl = this.paper.text(-6+20*i, 		185, 			i);
  	 			var tr = this.paper.text(195+20*(9-i), 	185, 			i);
  	 			var tt = this.paper.text(185, 			-3+20*i, 		i);
  	 			var tb = this.paper.text(185, 			200+20*(9-i),	i);
  	 			
  	 			if(i>3) {
  	 				tl.attr({fill: '#fff'}); tr.attr({fill: '#fff'}); tt.attr({fill: '#fff'}); tb.attr({fill: '#fff'});
  	 			}
  	 			else {
  	 				tl.attr({fill: '#000'}); tr.attr({fill: '#000'}); tt.attr({fill: '#000'}); tb.attr({fill: '#000'});
  	 			}
  	 	    }
  	 	}
  	 	$("#"+this.stand).show();
   	}
   	else if (this.type == "Luftpistole") {
	   	for(var i = 9; i >= 0; i--) {
	   		var line;
  	 	    
  	 	    if (i == 0) {
	  	 	    line = this.paper.circle(185, 185, 12, 12 );
	  	 	    var a = this.paper.circle(185, 185, 6, 6 );
	  	 	    a.attr({ fill: '#000', stroke: '#fff' });
  	 	    }
  	 	    else line = this.paper.circle(185, 185, 12+20*i, 12+20*i );
  	 	    
  	 	    if(i>3) line.attr({ fill: '#fff', stroke: '#000' });
  	 	    else line.attr({ fill: '#000', stroke: '#fff' });
  	 	}
  	 	
  	 	for (var i = 9; i >= 0; i--) {
  	 	    if(i>0 && i<9) {
  	 	        var tl = this.paper.text(-15+20*i, 		185, 			i);
  	 			var tr = this.paper.text(205+20*(9-i), 	185, 			i);
  	 			var tt = this.paper.text(185, 			-13+20*i, 		i);
  	 			var tb = this.paper.text(185, 			209+20*(9-i),	i);
  	 			
  	 			if(i>6) {
  	 				tl.attr({fill: '#fff'}); tr.attr({fill: '#fff'}); tt.attr({fill: '#fff'}); tb.attr({fill: '#fff'});
  	 			}
  	 			else {
  	 				tl.attr({fill: '#000'}); tr.attr({fill: '#000'}); tt.attr({fill: '#000'}); tb.attr({fill: '#000'});
  	 			}
  	 	    }
  	 	}
  	 	$("#"+this.stand).show();
   	}
   	else {
	   	$("#"+this.stand).hide();
   	}
   	
   	
}