
angular.module('clg.controllers')
.controller('SyncController', function($scope, $rootScope, $state, $ionicSideMenuDelegate, $cordovaSQLite, $timeout,
	$http) {

	if ( $ionicSideMenuDelegate.isOpen() ) {
		$ionicSideMenuDelegate.toggleLeft();
	}

	//Start syncing all
	$scope.syncing = {
		current: 0,
		total: $rootScope.sync_catalogues.length,
		percent: 0
	};

	$scope.syncAll = function() {

		function setStep (numb) {
			var percent = 1;

			if ( numb < ($scope.syncing.total + 1) ) {
				percent = (100 / $scope.syncing.total) * (numb<$scope.syncing.total?numb/2:numb);
			}

			$scope.syncing.percent = percent;
			$scope.syncing.current = numb;
		}


		var _current = 0;
		function sync_now() {
			$rootScope.utils.loading();
			$rootScope.utils.sync_index = 0;

			if	( _current < $scope.syncing.total ) {
				
				setStep(_current + 1);


				$rootScope.sync_catalogues[_current].synced = 0;
				$rootScope.sync_catalogues[_current].synced_at = null;

				if ( $rootScope.sync_catalogues[_current].mapping ) {
					$http.get($rootScope.sync_catalogues[_current].api_url)
			    	.then(function(response) {

			    		$rootScope.utils.loaded();

			    		$rootScope.sync_catalogues[_current].total_records = response.data.length;
			    		$rootScope.utils.sync_index = 1;

			    		$rootScope.sync_catalogues[_current].mapping.bulk_sync(response.data, $rootScope.sync_catalogues[_current].label, 
			    			function() {
			    				var _synced_at = (new Date()).getTime();

			    				$rootScope.sync_catalogues[_current].synced = 1;
			    				$rootScope.sync_catalogues[_current].synced_at = _synced_at;
			    				$rootScope.sync_catalogues[_current].synced_at_local = moment(_synced_at).fromNow();

				    			_current++;
				    			sync_now();
				    		}
			    		);


			    	}, function() {
			    		$rootScope.utils.showAlert("Algo salio mal.", 'El servidor no responde, porfavor intenta mas tarde.');
			    		$rootScope.utils.loaded();

			    		sync_now();
			    	});
				} else {
					$rootScope.utils.loaded();
					_current++;
    			sync_now();
				}

			} else {
				$rootScope.utils.loaded();
    		$rootScope.utils.showAlert("Hecho", 'Sincronizacion realizada con exito.');
    		$state.go("sync");
			}
		}

		$timeout(function() {
			setStep(1);

			_current = 0;
			sync_now();
		}, 500);
	}



	if ( $state.current.name === "sync_start" ) {
		$scope.syncAll();
	}








  $scope.checkTables = function() {

  	$rootScope.utils.loading();

    $rootScope.Catalogos.Clientes.db.init();
    $rootScope.Catalogos.Productos.db.init();
    $rootScope.Catalogos.Productos.db.initSyncs();

    // $cordovaSQLite.execute($rootScope.database,  "DROP TABLE syncs");

    $rootScope.utils.checkedModuleTables = true;
    
    $timeout(function() {
    	$rootScope.utils.loaded();
    }, 500);
  }




  function checkLastSynced() {
  	for (var i = 0; i < $rootScope.sync_catalogues.length; i++) {
  		(function(i){
  			if ( $rootScope.sync_catalogues[i].mapping ) {
    			$rootScope.sync_catalogues[i].mapping.check_syncing(function(synced_at) {

    				$rootScope.sync_catalogues[i].synced = synced_at ? 1 : 0;
    				$rootScope.sync_catalogues[i].synced_at = synced_at;
    				$rootScope.sync_catalogues[i].synced_at_local = moment(synced_at).fromNow();
    				
    			});
    		}
  		})(i);
  	}

  	$rootScope.utils.checkedSyncing = true;
  }



  $rootScope.$watch('deviceReady', function(isReady) {
    if ( isReady ) {
      if ( !$rootScope.utils.checkedModuleTables ) {
        $scope.checkTables();
      }

      checkLastSynced();

    }
  });

});