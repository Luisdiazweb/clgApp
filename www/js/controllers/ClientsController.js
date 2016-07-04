
angular.module('clg.controllers')
.controller('ClientsController', function($rootScope, $state) {

	$scope.check_if_synced = function() {
		$rootScope.loading();
		$rootScope.Catalogos.Clientes.check_syncing(function(synced_at) {

			if ( !synced_at ) {
				$rootScope.showAlert("Sincronizacion requerida", "La base de datos no ha sido sincronizada, "
	      	+ "porfavor sincroniza los datos para continuar.");
	    	$state.go("home");
			}

			$rootScope.loaded();

		});
	}


	$scope.check_if_synced();
	

});