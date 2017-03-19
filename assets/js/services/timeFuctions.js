angular.module('dsv.services.timeFunctions', [])

.filter('colorFromString', function() {
	return function(x) {
		return "#"+md5(x).substring(0,6);
	};
})

.factory('timeFunctions', ["$timeout", function timeFunctions($timeout) {
	var _intervals = {}, _intervalUID = 1;

	return {
		$setInterval: function(operation, interval, $scope) {
			var _internalId = _intervalUID++;
			_intervals[ _internalId ] = $timeout(function intervalOperation(){
				operation( $scope || undefined );
				_intervals[ _internalId ] = $timeout(intervalOperation, interval);
			}, interval);

			return _internalId;
		},

		$clearInterval: function(id) {
			return $timeout.cancel( _intervals[ id ] );
		}
	};
}]);
