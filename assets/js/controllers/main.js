angular.module('dsv.controllers.main', [])


.controller('lines', function ($scope, gatewaySocket) {
	var activelines;
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
		updateUI();
	});

	function updateUI(){
		$scope.hidden = activelines.length !== 0;

		itemsPerLine = Math.round(Math.pow(activelines.length, 0.5));
		if (itemsPerLine < 2) itemsPerLine = 2;

		$scope.linesList = [];
		for (var i = 0; i < activelines.length; i=i+itemsPerLine){
			var standLine = [];

			for (var ii = 0; ii < itemsPerLine; ii++){
				if (i+ii < activelines.length){
					var s = activelines[i+ii];
					s.index = i+ii;
					standLine.push(s);
				}
			}
			$scope.linesList.push(standLine);
		}
	}
})



// TODO: Now, each line recives all events.
.controller('stand', function ($scope, $timeout, gatewaySocket) {
	$scope.empty = true;

	$timeout(function(){
		$scope.$watch('stand', function(value, old){
			$scope.stand = value;
			updateUI();
		});
	});

	function updateUI(){
		gatewaySocket.emit("setLine", {
			line: $scope.stand.id,
			method: "getSession",
			data: {},
		});
		gatewaySocket.on("setSession", function(data){

			if (data.line != $scope.stand.id) return;

			var session = data.data;

			$scope.zoomlevel = session.disziplin.scheibe.defaultZoom;

			$scope.scheibe = session.disziplin.scheibe;
			$scope.probeecke = session.disziplin.parts[session.type].probeEcke;

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
						$scope.zoomlevel = scheibe.minZoom;
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
		});
	}

	return {
		scope: {
			stand: '=',
		},
	};


});
