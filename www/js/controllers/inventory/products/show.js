
angular.module('clg.controllers')
.controller('ProductDetails', function($rootScope, $scope, $state, $stateParams, $timeout) {

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



	$scope.showProduct = function(id) {
		$rootScope.utils.loading();
		$rootScope.utils.backgroundLoading = true;
		
		$rootScope.Catalogos.Productos.products.find(id).then(function(res) {
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

			$rootScope.inventario.productos.actual = product;
			$rootScope.utils.backgroundLoading = false;
			$rootScope.utils.loaded();
		}, function(err) {
			console.log("ERROR", err);
		});
	}





	if ( typeof $stateParams.id !== "undefined" ) {
		$scope.check_if_synced(function() {
			$scope.showProduct($stateParams.id);
		});
	} else {
		$rootScope.utils.showAlert("Error", "No se indico el codigo de producto.");
		$state.go("productos");
	}
	

});