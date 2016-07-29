
angular.module('clg.controllers')
.controller('ClientDetails', function($rootScope, $scope, $state, $stateParams, $timeout) {

	$scope.check_if_synced = function(callback) {
		$rootScope.utils.loading();
		$rootScope.Catalogos.Clientes.check_syncing(function(synced_at) {

			if ( !synced_at ) {
				$rootScope.utils.showAlert("Sincronizacion requerida", "La base de datos no ha sido sincronizada, "
	      	+ "por favor sincroniza los datos para continuar.");
	    	$state.go("home");
			} else {
				callback.call(this);
			}

			$rootScope.utils.loaded();

		});
	}



	$scope.showClient = function(id) {
		$rootScope.utils.loading();
		$rootScope.utils.backgroundLoading = true;
		
		$rootScope.Catalogos.Clientes.find(id).then(function(res) {
			var client = {};

			for (var key in res.rows.item(0)) {
				var _value = res.rows.item(0)[key];
				if ( typeof _value === "string" ) {
					client[key] = _value.toLowerCase();
				} else {
					client[key] = _value;
				}
			}

			// console.log(res.rows);

			$rootScope.clientes.actual.datos = client;

			$timeout(function() {
				$scope.fetchFacturas($rootScope.clientes.actual.datos.ClienteCodigo, 5, function(results) {
					$rootScope.clientes.actual.facturas.ultimas = results;
					$rootScope.utils.backgroundLoading = false;
				});
			}, 500);

			$rootScope.utils.loaded();
		});
	}


	$scope.fetchFacturas = function(id, limit, callback) {
		var client_id = id;

		$rootScope.Catalogos.Clientes.facturas(client_id, 5).then(function(res) {

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

		}, function (err) {
			console.log("ERROR seleccionando facturas", err);
		});
	}




	if ( typeof $stateParams.id !== "undefined" ) {
		$scope.check_if_synced(function() {
			$scope.showClient($stateParams.id);
		});
	} else {
		$rootScope.utils.showAlert("Error", "No se indico el codigo de cliente.");
		$state.go("clientes");
	}
	

});