/* -----------------------------------
 * Scheibenanzeige für Häring ESA
 * 
 * /public/parser.js (Parser Object)
 *
 * (c) 2014 Jannik Lorenz
 * ----------------------------------- */
 
 
function Parser(data) {
	
	var value = data.value;
	
	var b0 = value.search("\"Schuetze :\"");
  	var b1 = value.search("\"Probe :\"");
  	var b2 = value.search("\"Match :\"");
  	var b3 = value.search("\"Scheibe :\"");
  	var b4 = value.search("\"Waffe :\"");
  	var b5 = value.search("\"Klasse :\"");
  	var b6 = value.search("\"Wettbewerb :\"");
  	var b7 = value.search("\"Linie :\"");
  		
  	var v0 = value.substring( 0, b0-1);
  	var v1 = value.substring(b0, b1-1);
  	var v2 = value.substring(b1, b2-1);
  	var v3 = value.substring(b2, b3-1);
  	var v4 = value.substring(b3, b4-1);
  	var v5 = value.substring(b4, b5-1);
 	var v6 = value.substring(b5, b6-1);
 	var v7 = value.substring(b6, b7-1);
  	var v8 = value.substring(b7, value.length);
	
	var stand = data.filename.substring(11, data.filename.length);
  	var stand = stand.substring(0, stand.search("s"));
  	
  	var probeList = this.parseShoots(v2);
  	var matchList = this.parseShoots(v3);
  	
  	var linie = linien["l"+stand];
  	if (linie) {
  		linie.type = this.parseType(v5);
	  	linie.drawPaper();
	  	if (matchList.length > 0) {
	  		linie.mode = 1;
	  		linie.addNewShot(matchList);
	  	}
	  	else {
	  		linie.mode = 0;
	  		linie.addNewShot(probeList);
	  	}
	  	linie.setName(this.parseName(v1));
  	}
}

/* --- parseName --- */
Parser.prototype.parseName = function(s) {
	return "Max Muster !Diana";//s.substring(15, s.length-17);
}

/* --- parseType --- */
Parser.prototype.parseType = function(s) {
	var a = s.substring(12, s.length-17);  
	var p1 = a.search("\"");
	var b = a.substring(0, p1); 
	return b; 	
}

/* --- parseShoots --- */
Parser.prototype.parseShoots = function(s) {
  	var a = s.split('\n');
  	var shotList = [];
      	
  	for (var i = 15; i < a.length; i=i+9) {
  		var shot = new Shot();
  		shot.value = a[i+0];
  		shot.x = a[i+2];
  		shot.y = a[i+3];
  		shot.a = a[i+4];
 		shot.z = a[i+5];
  		shot.time = a[i+6];
      		
  		if (shot.x != null && 
  			shot.y != null && 
  			shot.a != null && 
  			shot.z != null && 
  			shot.time != null && 
  			parseFloat(shot.value.substring(1, shot.value.length-2)) < 11 && 
  			shot.value.substring(0, 1) == "\""
  			) shotList.push(shot);
  	}
  	return shotList;
}
