angular.module('dsv.controllers.main', [])


.controller('staende', function ($scope, staende) {

	function updateUI(){
		var activeStaende = []
		for (var i in staende){
			if (staende[i].isConnected == true){
				activeStaende.push(staende[i])
			}
		}

		$scope.staendeList = []
		for (var i = 0; i < activeStaende.length; i=i+4){
			var standLine = [activeStaende[i]]
			if (i+1 < activeStaende.length){
				standLine.push(activeStaende[i+1])
			}
			if (i+2 < activeStaende.length){
				standLine.push(activeStaende[i+2])
			}
			if (i+3 < activeStaende.length){
				standLine.push(activeStaende[i+3])
			}
			$scope.staendeList.push(standLine)
		}

		console.log($scope.staendeList)
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



.controller('stand', function ($scope, staende) {

	$scope.init = function(y, x){
		var stand = staende[y*4+x]
		var socket = stand.socket

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
				for (var i in session.serieHistory){
					for (var ii in session.serieHistory[i]){
						$scope.gesamt += session.serieHistory[i][ii].ringInt
					}
				}

				$scope.serie = session.serieHistory[session.selection.serie]
				$scope.selectedshotindex = session.selection.shot
				$scope.activeShot = session.serieHistory[session.selection.serie][session.selection.shot]
			}
			else {
				$scope.serieSums = []
				$scope.activeShot = undefined
				$scope.serie = []
				$scope.selectedshotindex = -1
			}

		})
	}

})
