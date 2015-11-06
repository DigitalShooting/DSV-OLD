angular.module('dsv.services.lines', ["btford.socket-io"])
.factory('gatewaySocket', ["socketFactory", function (socketFactory) {
	var gatewaySocket = socketFactory({
		ioSocket: io.connect("127.0.0.1:4000")
	})

	return gatewaySocket
}])


angular.module("dsv", [
	"dsv.services.grafik", "dsv.services.lines",
	"dsv.controllers.main",

	"ngAnimate",
])
