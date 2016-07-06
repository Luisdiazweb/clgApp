
angular.module('clg.controllers')
.controller('ProductsController', function($rootScope, $scope, $state, $stateParams, $timeout) {

	$scope.check_if_synced = function(callback) {
		$rootScope.loading();
		$rootScope.Catalogos.Clientes.check_syncing(function(synced_at) {

			if ( !synced_at ) {
				$rootScope.showAlert("Sincronizacion requerida", "La base de datos no ha sido sincronizada, "
	      	+ "porfavor sincroniza los datos para continuar.");
	    	$state.go("home");
			} else {
				callback.call(this);
			}

			$rootScope.loaded();

		});
	}


	$scope.backgroundLoading = false;


	$scope.prevPageFacturas = function() {
		if ($rootScope.clientes.actual.facturas.pagina_actual > 1) {
			--$rootScope.clientes.actual.facturas.pagina_actual;
		}
	}

	$scope.nextPageFacturas = function() {

		if ( $scope.backgroundLoading ) {
			return false;
		}

		$scope.backgroundLoading = true;

		$scope.fetchFacturasPaginated($rootScope.clientes.actual.datos.ClienteCodigo, 
			$rootScope.clientes.actual.facturas.pagina_actual+1, 
			function(results) {
				$rootScope.clientes.actual.facturas.todas[$rootScope.clientes.actual.facturas.pagina_actual+1] = results;
				$rootScope.clientes.actual.datos = results[0];
				$scope.backgroundLoading = false;
				++$rootScope.clientes.actual.facturas.pagina_actual;
			}
		);

	}






	$scope.prevPage = function() {
		if ($rootScope.clientes.pagina_actual > 1) {
			--$rootScope.clientes.pagina_actual;
		}
	}

	$scope.nextPage = function() {

		if ( $scope.backgroundLoading ) {
			return false;
		}

		$scope.backgroundLoading = true;

		$rootScope.Catalogos.Clientes.page($rootScope.clientes.pagina_actual+1).then(function(res) {
			
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


			$timeout(function() {
				$rootScope.clientes.todos[$rootScope.clientes.pagina_actual+1] = _page_rows;
				++$rootScope.clientes.pagina_actual;
				$scope.backgroundLoading = false;
			}, 500);

		}, function(err) {
			// console.log(err);
		});
	}


	$scope.showClients = function() {
		$rootScope.loading();

		$rootScope.clientes.pagina_actual = 1;
		$rootScope.clientes.todos[$rootScope.clientes.pagina_actual] = [];

		$rootScope.Catalogos.Clientes.page(1).then(function(res) {
			
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


			$rootScope.clientes.todos[$rootScope.clientes.pagina_actual] = _page_rows;
			$rootScope.loaded();
		}, function(err) {
			// console.log(err);
		});
	}





	$scope.showClient = function(id) {
		$rootScope.loading();
		$scope.backgroundLoading = true;
		
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
					$scope.backgroundLoading = false;
				});
			}, 500);

			$rootScope.loaded();
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



	$scope.fetchFacturasPaginated = function(id, page, callback) {
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
		$scope.backgroundLoading = true;

		$rootScope.clientes.actual.facturas.pagina_actual = 1;

		$timeout(function() {
			$scope.fetchFacturasPaginated(client, $rootScope.clientes.actual.facturas.pagina_actual, function(results) {
				$rootScope.clientes.actual.facturas.todas[$rootScope.clientes.actual.facturas.pagina_actual] = results;
				$rootScope.clientes.actual.datos = results[0];
				$scope.backgroundLoading = false;
			});
		}, 500);
	}


	$scope.showFactura = function(client, factura) {
		$scope.backgroundLoading = true;

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

			$scope.backgroundLoading = false;
		});
	}

	switch ($state.current.name) {
		case 'clientes_detalle':
			if ( typeof $stateParams.id !== "undefined" ) {
				$scope.check_if_synced(function() {
					$scope.showClient($stateParams.id);
				});
				break;
			}
		case 'clientes_facturas':
			if ( typeof $stateParams.id !== "undefined" ) {
				$scope.check_if_synced(function() {
					$scope.showFacturas($stateParams.id);
				});
				break;
			}
		case 'clientes_facturas_detalle':
			if ( typeof $stateParams.id !== "undefined" && typeof $stateParams.factura !== "undefined" ) {
				$scope.check_if_synced(function() {
					$scope.showFactura($stateParams.id, $stateParams.factura);
				});
				break;
			}
		default:
			$scope.check_if_synced($scope.showClients);
	}
	

});