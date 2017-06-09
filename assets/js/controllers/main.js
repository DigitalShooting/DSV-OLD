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

	/**
	 Add all modules to the itemList and trigger resize to recalculate the sizes
	 */
	function updateUI(){
		var itemList = [];
		itemList.push({
			type: "time",
		});

		if (activelines.length != 0) {
			for (var id in teams){
				itemList.push({
					type: "team",
					data: teams[id],
				});
			}
			for (var id in activelines){
				itemList.push({
					type: "line",
					data: activelines[id],
				});
			}
		}
		else {
			itemList.push({
				type: "noLines",
			});
		}

		$scope.itemList = itemList;

		resize();
	}

	/**
	 Calculate a good x y ratio for the grid.
	 Returns an object {x: ..., y: ...}
	 */
	function recalculateXY(itemList) {
		// diff ratio of the window, 1.0 if its exactly 16/9 (which the page
		// was designed for), bigger if the width is bigger than the height
		// (in ratio to 16/9), or otherwise for smaller than 1.0.
		var ratioDiff = $window.innerWidth/$window.innerHeight * 9/16;

		// the number of items in a row will be count(items)^(0.45*ratioDiff)
		var x = Math.round( Math.pow(itemList.length, 0.45 * ratioDiff));

		// fix possible bigger x than items
		if (x > itemList.length) x = itemList.length;

		return {
			x: x,
			// the number of rows will be the next integer solution for
			// count(items)/ x
			y: Math.ceil( itemList.length / x),
		};
	}

	window.addEventListener('load', resize, false);
	window.addEventListener('resize', resize, false);

	/**
	 Calculate the size object after resizing the window or reciving new data.
	 We split the elements into rows and colums. If the cells height is bigger
	 than its width, we will use vertical mode with the target at the top and
	 the data below. Otherwise ists horizontal mode, the target on the left and
	 the data on the right.
	 */
	function resize() {
		var pos = recalculateXY($scope.itemList);

		// height and width of the entire cell
		var h = $(document).height() / pos.y;
		var w = $(document).width() / pos.x;



		// target size (height and width)
		var targetSize;

		// x and y offset for the target
		var targetOffset = {
			x: 0,
			y: 0,
		};

		// string with the used mode for the frontend
		// - horizontal: horizontal mode
		// - vertical: vertical mode
		var mode;

		// Size of the data in relation to the size of the image.
		// 2: Image and data section are even
		// 3: Image is 1/3, data 2/3
		// ...
		var imageRatio = 2.5;

		// height is smaller then width, horizontal mode
		if (h < w) {
			mode = "horizontal";

			// the image in ratio is smaller than the full heigth of the cell so
			// we set an y offset to center it.
			if (w/imageRatio < h) {
				targetSize = w/imageRatio;
				targetOffset.y = (h-targetSize)/2;
			}
			// the image in ratio would be bigger than the full height, so we
			// set the full height as target size. No Centering here, we need
			// all the space to show the data.
			else {
				targetSize = h;
			}
		}

		// height is bigger (or even) than width, vertical mode
		else {
			mode = "vertical";

			// the image in ratio is smaller than the full widht of the cell so
			// we set an x offset to center it.
			if (h/imageRatio < w) {
				targetSize = h/imageRatio;
				targetOffset.x = (w-targetSize)/2;
			}
			// the image in ratio would be bigger than the full width of the
			// cell, so we set the full width as target size. No Centering here,
			// we need all the space to show the data.
			else {
				targetSize = w;
			}
		}

		$scope.size = {
			height: h,
			width: w,
			target: {
				size: targetSize,
				offset: targetOffset,
			},
			text: {
				size: {
					width: mode == "vertical" ? w : w - targetSize,
					height: mode == "vertical" ? h - targetSize : h,
				},
			},
			mode: mode,
			x: pos.x,
			y: pos.y,
		};

		setTimeout(function() {
			$('.autoSize').quickfit({max: 40});
		}, 300);
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

		setTimeout(function() {
			$('#'+$scope.stand.id+' .autoSize').quickfit({max: 40});
		}, 300);
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
		// the last x serien of the session to show
		$scope.lastSerien = [];
		// Number of colums we divide the lastSerien into in the ui
		$scope.serienColums = 1;

		if (session.serien.length > 0){

			// Show only last 4 serien (5-1)
			for (var i = session.serien.length-1; (i > session.serien.length-5 && i >= 0); i--){
				$scope.lastSerien.unshift(session.serien[i]);
			}
			$scope.serienColums = Math.round($scope.lastSerien.length / 4);

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
