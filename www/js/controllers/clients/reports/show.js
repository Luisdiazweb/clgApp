
angular.module('clg.controllers')
.controller('ClientReportDetails', function($rootScope, $scope, $state, $stateParams, $timeout) {

	$scope.check_if_synced = function(callback) {
		$rootScope.utils.loading();
		$rootScope.Catalogos.Clientes.check_syncing(function(synced_at) {

			if ( !synced_at ) {
				$rootScope.utils.showAlert("Sincronizacion requerida", "La base de datos no ha sido sincronizada, "
	      	+ "porfavor sincroniza los datos para continuar.");
	    	$state.go("home");
			} else {
				callback.call(this);
			}

			$rootScope.utils.loaded();

		});
	}

	$scope.showFactura = function(client, factura) {
		$$rootScope.utils.backgroundLoading = true;

		$rootScope.Catalogos.Clientes.factura(client, factura).then(function(res) {
			var _factura = {};

			for (var key in res.rows.item(0)) {
				var _value = res.rows.item(0)[key];
				if ( typeof _value === "string" ) {
					_factura[key] = _value.toLowerCase();
				} else {
					_factura[key] = _value;
				}
			}

			$rootScope.clientes.actual.facturas.actual = _factura;
			$rootScope.clientes.actual.datos = _factura;

			$$rootScope.utils.backgroundLoading = false;
		});
	}



	if ( typeof $stateParams.id !== "undefined" && typeof $stateParams.factura !== "undefined" ) {
		$scope.check_if_synced(function() {
			$scope.showFactura($stateParams.id, $stateParams.factura);
		});
	} else {
		$rootScope.utils.showAlert("Error", "No se ha indicado el codigo de cliente o el correspondiente de factura.");
	}
	

});