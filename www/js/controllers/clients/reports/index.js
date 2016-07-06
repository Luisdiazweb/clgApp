
angular.module('clg.controllers')
.controller('ClientReports', function($rootScope, $scope, $state, $stateParams, $timeout) {

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



	$scope.prevPage = function() {
		if ($rootScope.clientes.actual.facturas.pagina_actual > 1) {
			--$rootScope.clientes.actual.facturas.pagina_actual;
		}
	}

	$scope.nextPage = function() {

		if ( $rootScope.utils.backgroundLoading ) {
			return false;
		}

		$rootScope.utils.backgroundLoading = true;

		$scope.fetchFacturas($rootScope.clientes.actual.datos.ClienteCodigo, 
			$rootScope.clientes.actual.facturas.pagina_actual+1, 
			function(results) {
				$rootScope.clientes.actual.facturas.todas[$rootScope.clientes.actual.facturas.pagina_actual+1] = results;
				$rootScope.clientes.actual.datos = results[0];
				$rootScope.utils.backgroundLoading = false;
				++$rootScope.clientes.actual.facturas.pagina_actual;
			}
		);

	}



	$scope.fetchFacturas = function(id, page, callback) {
		var client_id = id;

		$rootScope.Catalogos.Clientes.facturas_paged(client_id, page).then(function(res) {

			var _page_rows = [];
			for (var i = 0; i < res.rows.length; i++) {
				var _item = {};

				for (var key in res.rows.item(i)) {
					var _value = res.rows.item(i)[key];
					if ( typeof _value === "string" ) {
						_item[key] = _value.toLowerCase();
					} else {
						_item[key] = _value;
					}
				}

				_page_rows.push(_item);
			}

			callback.call(this, _page_rows);
			$rootScope.clientes.actual.datos = _page_rows[0];

		}, function (err) {
			console.log("ERROR seleccionando facturas", err);
		});
	}


	$scope.showFacturas = function(client) {
		$rootScope.utils.backgroundLoading = true;

		$rootScope.clientes.actual.facturas.pagina_actual = 1;

		$timeout(function() {
			$scope.fetchFacturas(client, $rootScope.clientes.actual.facturas.pagina_actual, function(results) {
				$rootScope.clientes.actual.facturas.todas[$rootScope.clientes.actual.facturas.pagina_actual] = results;
				$rootScope.clientes.actual.datos = results[0];
				$rootScope.utils.backgroundLoading = false;
			});
		}, 500);
	}


	if ( typeof $stateParams.id !== "undefined" ) {
		$scope.check_if_synced(function() {
			$scope.showFacturas($stateParams.id);
		});
	} else {
		$rootScope.utils.showAlert("Error", "No se ha indicado el codigo de cliente.");
	}
	

});