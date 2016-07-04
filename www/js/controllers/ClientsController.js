
angular.module('clg.controllers')
.controller('ClientsController', function($rootScope, $scope, $state, $stateParams) {

	$scope.check_if_synced = function() {
		$rootScope.loading();
		$rootScope.Catalogos.Clientes.check_syncing(function(synced_at) {

			if ( !synced_at ) {
				$rootScope.showAlert("Sincronizacion requerida", "La base de datos no ha sido sincronizada, "
	      	+ "porfavor sincroniza los datos para continuar.");
	    	$state.go("home");
			} else {
				$scope.showClients();
			}

			$rootScope.loaded();

		});
	}



	$scope.clientes = {
		current_page: 1,
		page: {}
	};

	$scope.cliente = {};


	$scope.showClients = function() {
		$rootScope.loading();

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


			$scope.clientes.page[$scope.clientes.current_page] = _page_rows;
			$rootScope.loaded();
		}, function(err) {
			console.log(err);
		});
	}





	$scope.showClient = function(id) {
		$rootScope.loading();
		
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

			console.log(res.rows);

			$scope.cliente = client;

			$rootScope.loaded();
		});
	}



	if ( typeof $stateParams.id !== "undefined" ) {
		$scope.showClient($stateParams.id);
	} else {
		$scope.check_if_synced();
	}
	

});