
angular.module('clg.controllers')
.controller('LoginController', function($rootScope) {

	$rootScope.$watch('deviceReady', function(isReady) {
		if ( isReady ) {
			$rootScope.loginmanager.checkIfWasAuth();
		}
	});

});