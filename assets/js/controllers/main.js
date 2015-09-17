angular.module('dsv.controllers.main', [])


.controller('lines', function ($scope, lines) {
	var activelines = []
	var itemsPerLine = 0

	function updateUI(){
		var activelines = []
		for (var i in lines){
			if (lines[i].isConnected == true){
				activelines.push(lines[i])
			}
		}

		$scope.hidden = activelines.length != 0

		var itemsPerLine = Math.round(Math.pow(activelines.length, 0.5))
		if (itemsPerLine < 2) itemsPerLine = 2

		$scope.linesList = []
		for (var i = 0; i < activelines.length; i=i+itemsPerLine){
			var standLine = []

			for (var ii = 0; ii < itemsPerLine; ii++){
				if (i+ii < activelines.length){
					var s = activelines[i+ii]
					s.index = i+ii
					standLine.push(s)
				}
			}
			$scope.linesList.push(standLine)
		}
	}

	updateUI()


	for (i in lines){
		var stand = lines[i]

		stand.socket.on("connect", function(){
			updateUI()
		})
		stand.socket.on("disconnect", function(){
			updateUI()
		})
	}


})



.controller('stand', function ($scope, lines, $timeout) {
	$scope.empty = true
	$scope.stand

	$timeout(function(){
		$scope.$watch('stand', function(value, old){
			$scope.stand = value
			updateUI()
		})
	})

	function updateUI(){
		var socket = $scope.stand.socket

		socket.emit('getSession', {})
		socket.on("setSession", function(session){
			$scope.zoomlevel = session.disziplin.scheibe.defaultZoom

			$scope.scheibe = session.disziplin.scheibe
			$scope.probeecke = session.disziplin.parts[session.type].probeEcke

			$scope.session = session

			if (session.serien.length > 0){
				$scope.serie = session.serien[session.selection.serie]
				$scope.selectedshotindex = session.selection.shot
				$scope.activeShot = session.serien[session.selection.serie].shots[session.selection.shot]
				$scope.empty = false

				if ($scope.serie != undefined && $scope.serie.length != 0) {
					var ringInt = $scope.serie.shots[session.selection.shot].ringInt
					var ring = $scope.scheibe.ringe[$scope.scheibe.ringe.length - ringInt]

					if (ring){
						$scope.zoomlevel = ring.zoom
					}
					else if (ringInt == 0){
						$scope.zoomlevel = scheibe.minZoom
					}
				}
			}
			else {
				$scope.serieSums = []
				$scope.activeShot = undefined
				$scope.serie = []
				$scope.selectedshotindex = -1
				$scope.empty = true
			}
		})
	}

	return {
		scope: {
			stand: '=',
		},
	}


})
