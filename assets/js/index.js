angular.module('dsv.services.lines', ["btford.socket-io"])
.factory('gatewaySocket', ["socketFactory", function (socketFactory) {
	var gatewaySocket = socketFactory({
		ioSocket: io.connect(dscGatewayUrl)
	})

	return gatewaySocket
}])


angular.module("dsv", [
	"dsv.services.grafik", "dsv.services.lines",
	"dsv.controllers.main",

	"ngAnimate",
])
