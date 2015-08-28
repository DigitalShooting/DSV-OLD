angular.module('dsv.controllers.main', [])


.controller('staende', function ($scope, staende) {
	var activeStaende = []
	var itemsPerLine = 0

	function updateUI(){
		var activeStaende = []
		for (var i in staende){
			if (staende[i].isConnected == true){
				activeStaende.push(staende[i])
			}
		}
		var itemsPerLine = Math.round(Math.pow(activeStaende.length, 0.5))
		if (itemsPerLine < 2) itemsPerLine = 2

		$scope.staendeList = []
		for (var i = 0; i < activeStaende.length; i=i+itemsPerLine){
			var standLine = []

			for (var ii = 0; ii < itemsPerLine; ii++){
				if (i+ii < activeStaende.length){
					var s = activeStaende[i+ii]
					s.index = i+ii
					standLine.push(s)
				}
			}
			$scope.staendeList.push(standLine)
		}
	}

	updateUI()


	for (i in staende){
		var stand = staende[i]

		stand.socket.on("connect", function(){
			updateUI()
		})
		stand.socket.on("disconnect", function(){
			updateUI()
		})
	}


})



.controller('stand', function ($scope, staende, $timeout) {
	$scope.empty = true
	$scope.stand

	$timeout(function(){
		$scope.$watch('stand', function(value, old){
			console.log(value)
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

			if (session.serieHistory.length > 0){
				$scope.activeSerie = session.serieHistory[session.selection.serie]

				$scope.serieSums = []
				for (var i = (session.serieHistory.length<8 ? 0 : session.serieHistory.length-8); i < session.serieHistory.length; i++){
					var sum = 0
					for (var ii in session.serieHistory[i]){
						sum += session.serieHistory[i][ii].ringInt
					}
					$scope.serieSums.push(sum)
				}

				$scope.gesamt = 0
				$scope.anzahlShots = 0
				for (var i in session.serieHistory){
					for (var ii in session.serieHistory[i]){
						$scope.gesamt += session.serieHistory[i][ii].ringInt
						$scope.anzahlShots++
					}
				}
				$scope.schnitt = (Math.round($scope.gesamt / $scope.anzahlShots * 10)/10).toFixed(1)

				$scope.serie = session.serieHistory[session.selection.serie]
				$scope.selectedshotindex = session.selection.shot
				$scope.activeShot = session.serieHistory[session.selection.serie][session.selection.shot]
				$scope.empty = false

				if ($scope.serie != undefined && $scope.serie.length != 0) {
					var ringInt = $scope.serie[session.selection.shot].ringInt
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
