
angular.module('clg.controllers')
.controller('Clients', function($rootScope, $scope, $state, $timeout) {


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




	$scope.prevPage = function() {
		if ($rootScope.clientes.pagina_actual > 1) {
			--$rootScope.clientes.pagina_actual;
		}
	}

	$scope.nextPage = function() {

		if ( $rootScope.utils.backgroundLoading ) {
			return false;
		}

		$rootScope.utils.backgroundLoading = true;

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
				$rootScope.utils.backgroundLoading = false;
			}, 500);

		}, function(err) {
			// console.log(err);
		});
	}


	$scope.showClients = function() {
		$rootScope.utils.loading();

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
			$rootScope.utils.loaded();
		}, function(err) {
			// console.log(err);
		});
	}



	$scope.check_if_synced($scope.showClients);
	

});