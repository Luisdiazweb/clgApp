
angular.module('clg.controllers')
.controller('CategoryDetails', function($rootScope, $scope, $state, $stateParams, $timeout) {

	$scope.check_if_synced = function(callback) {
		$rootScope.utils.loading();
		$rootScope.Catalogos.Productos.check_syncing(function(synced_at) {

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
		if ($rootScope.inventario.categorias.productos.pagina_actual > 1) {
			--$rootScope.inventario.categorias.productos.pagina_actual;
		}
	}

	$scope.nextPage = function() {

		if ( $rootScope.utils.backgroundLoading ) {
			return false;
		}

		$rootScope.utils.backgroundLoading = true;

		$rootScope.Catalogos.Productos.categories.find($stateParams.id, $rootScope.inventario.categorias.productos.pagina_actual+1)
		.then(function(res) {
			
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
				$rootScope.inventario.categorias.productos.resultados[$rootScope.inventario.categorias.productos.pagina_actual+1] = _page_rows;
				++$rootScope.inventario.categorias.productos.pagina_actual;
				$rootScope.utils.backgroundLoading = false;
			}, 500);

		}, function(err) {
			// console.log(err);
		});
	}








	$scope.showCategory = function(id) {
		$rootScope.utils.loading();
		$rootScope.utils.backgroundLoading = true;
		
		$rootScope.Catalogos.Productos.categories.find(id, 1).then(function(res) {
			var product = {};

			for (var key in res.rows.item(0)) {
				var _value = res.rows.item(0)[key];
				if ( typeof _value === "string" ) {
					product[key] = _value.toLowerCase();
				} else {
					product[key] = _value;
				}
			}

			// console.log(res.rows);

			$rootScope.inventario.categorias.actual = product;

			$rootScope.inventario.categorias.productos.pagina_actual = 1;
			$rootScope.inventario.categorias.productos.resultados[$rootScope.inventario.categorias.productos.pagina_actual] = [];
				
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

			$rootScope.inventario.categorias.productos.resultados[$rootScope.inventario.categorias.productos.pagina_actual] = _page_rows;


			$rootScope.utils.backgroundLoading = false;
			$rootScope.utils.loaded();
		}, function(err) {
			console.log("ERROR", err);
		});
	}





	if ( typeof $stateParams.id !== "undefined" ) {
		$scope.check_if_synced(function() {
			$scope.showCategory($stateParams.id);
		});
	} else {
		$rootScope.utils.showAlert("Error", "No se indico el codigo de categoria.");
		$state.go("productos");
	}
	

});