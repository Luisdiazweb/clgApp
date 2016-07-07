
angular.module('clg.controllers')
.controller('Trademarks', function($rootScope, $scope, $state, $timeout) {


	$scope.check_if_synced = function(callback) {
		$rootScope.utils.loading();
		$rootScope.Catalogos.Productos.check_syncing(function(synced_at) {

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
		if ($rootScope.inventario.marcas.pagina_actual > 1) {
			--$rootScope.inventario.marcas.pagina_actual;
		}
	}

	$scope.nextPage = function() {

		if ( $rootScope.utils.backgroundLoading ) {
			return false;
		}

		$rootScope.utils.backgroundLoading = true;

		$rootScope.Catalogos.Productos.trademarks.page($rootScope.inventario.marcas.pagina_actual+1).then(function(res) {
			
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
				$rootScope.inventario.marcas.resultados[$rootScope.inventario.marcas.pagina_actual+1] = _page_rows;
				++$rootScope.inventario.marcas.pagina_actual;
				$rootScope.utils.backgroundLoading = false;
			}, 500);

		}, function(err) {
			// console.log(err);
		});
	}


	$scope.showMarcas = function() {
		$rootScope.utils.loading();

		$rootScope.inventario.marcas.pagina_actual = 1;
		$rootScope.inventario.marcas.resultados[$rootScope.inventario.marcas.pagina_actual] = [];

		$rootScope.Catalogos.Productos.trademarks.page(1).then(function(res) {
			
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


			$rootScope.inventario.marcas.resultados[$rootScope.inventario.marcas.pagina_actual] = _page_rows;
			$rootScope.utils.loaded();
		}, function(err) {
			// console.log(err);
		});
	}



	$scope.check_if_synced($scope.showMarcas);
	

});