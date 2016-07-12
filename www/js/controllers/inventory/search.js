
angular.module('clg.controllers')
.controller('InventorySearch', function($rootScope, $scope, $state, $stateParams, $timeout, $ionicPopover) {


	$scope.searchQuery = '';
	$scope.searchFilter = 'products';
	$scope.delay;
	$scope.popover;

	$scope.resulting = {
		trademarks: [],
		categories: []
	};

	$scope.filtersDropdown = {
		trademarks: '',
		categories: ''
	};


	$scope.searchFilters = [
		{
			text: 'Productos',
			value: 'products'
		},
		{
			text: 'Marcas',
			value: 'trademarks'
		},
		{
			text: 'Categorias',
			value: 'categories'
		}
	];

	$scope.watchFilter = function($event, item) {
		$scope.searchFilter = item.value;
	}

	$scope.watchDropdown = function($event) {
		$rootScope.inventario.busqueda.pagina_actual = 1;
		$rootScope.inventario.busqueda.resultados = [];

		if ( $scope.searchQuery.length ) {
			$scope.performSearch();
		}
	}

	$scope.clearSearch = function() {
		$scope.searchQuery=''; 
		$rootScope.inventario.busqueda.resultados = {};
	}


	$scope.$watch('searchFilter', function(filter) {

		$timeout(function() {
			if ( $scope.popover ) {
				$scope.popover.hide();
			}
		}, 100);

		$rootScope.inventario.busqueda.pagina_actual = 1;
		$rootScope.inventario.busqueda.resultados = [];

		if ( $scope.searchQuery.length ) {
			$scope.performSearch();
		}
	});


	$ionicPopover.fromTemplateUrl('views/inventario/filtros.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });


	$scope.$watch('searchQuery', function(query) {
		if ( $scope.delay || $rootScope.utils.backgroundLoading ) {
			clearTimeout($scope.delay);
		}

		$rootScope.utils.backgroundLoading = true;
		if ( $scope.searchQuery.trim() == "" ) {
			$rootScope.utils.backgroundLoading = false;
			return false;
		}

		$scope.delay = $timeout($scope.performSearch, 500);
	});


	$scope.useFilter = function(filter) {
		if ( $scope.searchFilter == "trademarks" ) {
			$scope.filtersDropdown.trademarks = filter;
		}

		if ( $scope.searchFilter == "categories" ) {
			$scope.filtersDropdown.categories = filter;
		}

		$scope.searchFilter = 'products';
	}




	$scope.prevPage = function() {
		if ($rootScope.inventario.busqueda.pagina_actual > 1) {
			--$rootScope.inventario.busqueda.pagina_actual;
		}
	}

	$scope.nextPage = function() {

		if ( $rootScope.utils.backgroundLoading ) {
			return false;
		}

		$rootScope.utils.backgroundLoading = true;

		
		$rootScope.Catalogos.Productos.search($scope.searchQuery, { filter: $scope.filtersDropdown, filterBy: $scope.searchFilter }, 
			$rootScope.inventario.busqueda.pagina_actual+1)
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
				$rootScope.inventario.busqueda.resultados[$rootScope.inventario.busqueda.pagina_actual+1] = _page_rows;
				++$rootScope.inventario.busqueda.pagina_actual;
				$rootScope.utils.backgroundLoading = false;
			}, 500);

		}, function(err) {
			console.log(err);
		});
	}


	$scope.performSearch = function() {
		$rootScope.utils.backgroundLoading = true;

		$rootScope.Catalogos.Productos.search($scope.searchQuery, { filter: $scope.filtersDropdown, filterBy: $scope.searchFilter }, 1)
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


			$rootScope.inventario.busqueda.resultados = {};
			$rootScope.inventario.busqueda.resultados[$rootScope.inventario.busqueda.pagina_actual] = [];
			$rootScope.inventario.busqueda.resultados[$rootScope.inventario.busqueda.pagina_actual] = _page_rows;

			$rootScope.utils.backgroundLoading = false;
		}, function(err) {
			console.log(err);
		});
	}


	$rootScope.fetchFilters = function() {
		$rootScope.utils.backgroundLoading = true;

		$rootScope.Catalogos.Productos.fetchTrademarks()
		.then(function(res) {
			var _page_rows = [];
			_page_rows.push({ Fabricante: '' });
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


			$scope.resulting.trademarks = _page_rows;

			$rootScope.Catalogos.Productos.fetchCategories()
			.then(function (res) {
				var _page_rows = [];
				_page_rows.push({ TipoDescripcion: '', TipoCodigo: '' });
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

				$scope.resulting.categories = _page_rows;

				$rootScope.utils.backgroundLoading = false;

			}, function(err) {
				// console.log(err);
			});

		}, function(err){
			// console.log(err);
		});
	}





	$scope.fetchFilters();




});