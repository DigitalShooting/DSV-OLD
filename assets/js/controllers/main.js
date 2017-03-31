angular.module('dsv.controllers.main', [
	"dsv.services.timeFunctions",
])

/**
 Main Line Controller to get data from dsc gateway and proccess it to the ui.
 */
.controller('lines', function ($scope, gatewaySocket, $window) {

	/**
	 Contains all lines from dsc gateway which are online
	 */
	var activelines = [];

	/**
	 Teams from dsc gateway
	 */
	var teams = [];

	/**
	 Frontend size of oure layout
	 */
	$scope.size = {
		x: 0,
		y: 0,
		height: 0,
		width: 0
	};

	/**
	 Contains lines and teams, wrapped in an object with a type id
	 */
	$scope.itemList = [];

	gatewaySocket.on("disconnect", function(){
		activelines = [];
		updateUI();
	});
	gatewaySocket.on("onlineLines", function(data){
		activelines = [];
		for(var id in data.lines){
			if (data.lines[id].online === true){
				activelines.push(data.lines[id]);
			}
		}
		teams = data.teams;
		updateUI();
	});

	function updateUI(){
		var itemList = [];
		itemList.push({
			type: "time",
		});

		if (activelines.length != 0) {
			for (var id in activelines){
				itemList.push({
					type: "line",
					data: activelines[id],
				});
			}
			for (var id in teams){
				itemList.push({
					type: "team",
					data: teams[id],
				});
			}
		}
		else {
			itemList.push({
				type: "noLines",
			});
		}




		$scope.size.x = Math.round( Math.pow(itemList.length, 0.45) );
		$scope.size.y = Math.ceil( itemList.length / $scope.size.x);

		$scope.itemList = itemList;

		resize();
	}

	window.addEventListener('load', resize, false);
	window.addEventListener('resize', resize, false);

	function resize() {
		$scope.size.height = ($window.innerHeight * 0.9)/ $scope.size.y;
		// $scope.size.width = (window.innerWidth * 0.9)/ $scope.size.x; // not needed currently
	}
})



/**
 Team Controller listens on "setTeam" event to update.
 */
.controller('team', function ($scope, $timeout, gatewaySocket) {

	$timeout(function(){
		$scope.$watch('item', function(value){
			$scope.team = value.data;
		});
	});

	// set up gateway socket listener
	gatewaySocket.on("setTeam", function(gatewayData){
		if (gatewayData.team.teamID !== $scope.team.teamID) return;
		$scope.team = gatewayData.team;
	});

})



/**
 Line Controller, listens on "setData" event and update single line.
 */
.controller('stand', function ($scope, $timeout, gatewaySocket) {

	// set up gateway socket listener
	gatewaySocket.on("setData", function(gatewayData){
		if ($scope.stand != null && gatewayData.line != $scope.stand.id) return;
		var data = gatewayData.data;
		updateUI(data);
	});


	$timeout(function(){
		$scope.$watch('item', function(value){
			$scope.stand = value.data;
		});

		$scope.$watch('stand', function(value){

			if (value === undefined) { return; }

			// if we have a cached version of the data, we set it
			if ($scope.stand.cache !== null) {
				if ($scope.stand.cache.setData !== null) {
					updateUI($scope.stand.cache.setData);
				}
			}
		});
	});

	function updateUI(data) {
		var session = data.sessionParts[data.sessionIndex];

		$scope.zoomlevel = data.disziplin.scheibe.defaultZoom;

		$scope.scheibe = data.disziplin.scheibe;
		$scope.probeecke = data.disziplin.parts[session.type].probeEcke;

		$scope.data = data;
		$scope.session = session;
		$scope.lastSerien = [];

		if (session.serien.length > 0){

			// Show only last 4 serien (5-1)
			for (var i = session.serien.length-1; (i > session.serien.length-5 && i >= 0); i--){
				$scope.lastSerien.unshift(session.serien[i]);
			}

			$scope.serie = session.serien[session.selection.serie];
			$scope.selectedshotindex = session.selection.shot;
			$scope.activeShot = session.serien[session.selection.serie].shots[session.selection.shot];

			if ($scope.serie !== undefined && $scope.serie.length !== 0) {
				var ringInt = $scope.serie.shots[session.selection.shot].ring.int;
				var ring = $scope.scheibe.ringe[$scope.scheibe.ringe.length - ringInt];

				if (ring){
					$scope.zoomlevel = ring.zoom;
				}
				else if (ringInt === 0){
					$scope.zoomlevel = $scope.scheibe.minZoom;
				}
			}
		}
		else {
			$scope.serieSums = [];
			$scope.activeShot = undefined;
			$scope.serie = [];
			$scope.selectedshotindex = -1;
		}
	}

	return {
		scope: {
			stand: '=',
		},
	};
})



/**
 Simple Controller to show the time.
 */
.controller('time', ['$scope', 'timeFunctions', function ($scope, timeFunctions) {
	var refreshIntervalId;

	function n(n){
		return n > 9 ? "" + n: "0" + n;
	}

	function refresh($scope){
		var date = new Date();

		$scope.time = n(date.getHours())+":"+n(date.getMinutes())+":"+n(date.getSeconds()) + " Uhr";
		$scope.date = n(date.getDate())+"."+n((date.getMonth()+1))+"."+n(date.getFullYear());
	}

	timeFunctions.$clearInterval( refreshIntervalId );
	refreshIntervalId = timeFunctions.$setInterval(refresh, 1000, $scope);
	refresh($scope);
}]);
