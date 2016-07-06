
angular.module('clg.controllers')
.controller('ClientsSearchController', function($rootScope, $scope, $state, $stateParams, $timeout) {


	$scope.backgroundLoading = false;

	$scope.searchQuery = '';
	$scope.delay;


	$scope.$watch('searchQuery', function(query) {
		if ( $scope.delay || $scope.backgroundLoading ) {
			clearTimeout($scope.delay);
		}

		$scope.backgroundLoading = true;
		if ( $scope.searchQuery.trim() == "" ) {
			$scope.backgroundLoading = false;
			return false;
		}

		$scope.delay = $timeout($scope.searchClients, 500);
	});




	$scope.prevPage = function() {
		if ($rootScope.clientes.busqueda.pagina_actual > 1) {
			--$rootScope.clientes.busqueda.pagina_actual;
		}
	}

	$scope.nextPage = function() {

		if ( $scope.backgroundLoading ) {
			return false;
		}

		$scope.backgroundLoading = true;

		
		$rootScope.Catalogos.Clientes.search($scope.searchQuery, $rootScope.clientes.busqueda.pagina_actual+1).then(function(res) {
			
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
				$rootScope.clientes.busqueda.resultados[$rootScope.clientes.busqueda.pagina_actual+1] = _page_rows;
				++$rootScope.clientes.busqueda.pagina_actual;
				$scope.backgroundLoading = false;
			}, 500);

		}, function(err) {
			// console.log(err);
		});
	}


	$scope.searchClients = function() {
		$scope.backgroundLoading = true;

		$rootScope.Catalogos.Clientes.search($scope.searchQuery, 1).then(function(res) {
			
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


			$rootScope.clientes.busqueda.resultados = {};
			$rootScope.clientes.busqueda.resultados[$rootScope.clientes.busqueda.pagina_actual] = [];
			$rootScope.clientes.busqueda.resultados[$rootScope.clientes.busqueda.pagina_actual] = _page_rows;

			$scope.backgroundLoading = false;
		}, function(err) {
			// console.log(err);
		});
	}




});