angular.module('dsv.controllers.main', [
	"dsv.services.timeFunctions",
])


.controller('lines', function ($scope, gatewaySocket) {
	var activelines;
	var teams = [];

	var itemsPerLine = 0;

	gatewaySocket.on("disconnect", function(data){
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
		$scope.hidden = activelines.length !== 0;

		var itemList = [];
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

		itemsPerLine = Math.round(Math.pow(itemList.length, 0.5));
		if (itemsPerLine < 2) itemsPerLine = 2;

		var items = [];
		for (var i = 0; i < itemList.length; i=i+itemsPerLine){
			var standLine = [];

			for (var ii = 0; ii < itemsPerLine; ii++){
				if (i+ii < itemList.length){
					var s = itemList[i+ii];
					s.index = i+ii;
					standLine.push(s);
				}
			}
			items.push(standLine);
		}
		$scope.items = items;

	}
})



.controller('team', function ($scope, $timeout, gatewaySocket) {

	$timeout(function(){
		$scope.$watch('item', function(value, old){
			$scope.team = value.data;
		});
	});

	// set up gateway socket listener
	gatewaySocket.on("setTeam", function(gatewayData){
		if (gatewayData.team.teamID !== $scope.team.teamID) return;
		$scope.team = gatewayData.team;
	});

})




// TODO: Now, each line recives all events.
.controller('stand', function ($scope, $timeout, gatewaySocket) {
	$scope.empty = true;


	// set up gateway socket listener
	gatewaySocket.on("setData", function(gatewayData){
		if (gatewayData.line != $scope.stand.id) return;
		var data = gatewayData.data;
		updateUI(data);
	});


	$timeout(function(){
		$scope.$watch('item', function(value, old){
			$scope.stand = value.data;
			console.log(value)
		});

		$scope.$watch('stand', function(value, old){

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
			$scope.empty = false;

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
			$scope.empty = true;
		}
	}

	return {
		scope: {
			stand: '=',
		},
	};


})




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
