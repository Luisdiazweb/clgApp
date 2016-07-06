
angular.module('clg.controllers')
.controller('ClientsSearchController', function($rootScope, $scope, $state, $stateParams, $timeout) {


	$scope.backgroundLoading = false;





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


	$scope.searchClients = function() {
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




});