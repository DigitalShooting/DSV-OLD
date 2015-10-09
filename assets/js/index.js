angular.module('dsv.services.lines', ["btford.socket-io"])
.factory('lines', ["socketFactory", function (socketFactory) {
	var lines = []

	function watch(stand){
		stand.socket.on("connect", function(){
			stand.isConnected = true
		})
		stand.socket.on("disconnect", function(){
			stand.isConnected = false
		})
	}

	for (var key in config.lines){
		var stand = config.lines[key]
		stand.socket = socketFactory({
			ioSocket: io.connect(stand.ip+":"+stand.port)
		})

		watch(stand)

		lines.push(stand)
	}

	return lines;
}])


angular.module("dsv", [
	"dsv.services.grafik", "dsv.services.lines",
	"dsv.controllers.main",

	"ngAnimate",
])
