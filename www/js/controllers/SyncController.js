
angular.module('clg.controllers')
.controller('SyncController', function($scope, $rootScope, $state, $cordovaSQLite, $timeout,
	$http, $ionicActionSheet) {



	if ( $state.current.name === "sync_start" ) {
		if ( !$rootScope.online ) {
			$rootScope.utils.showAlert('Notificacion de red', 
				'La ultima sincronizacion fallo debido a un problema de red. Es posible que no cuente con conexion de datos, '
				+ 'intentatemos establecer conexion con los servidores.');
		}

		if ( !$rootScope.syncManager.isSyncing ) {
      $rootScope.syncManager.syncAll();
    }
	}


  if ( $state.current.name === "sync_settings" ) {
    $rootScope.syncManager.tasks.fetchAll();
  }



  $scope.openEditSheet = function(item) {
    var editIcon = ionic.Platform.isAndroid() ? '<i class="icon ion-edit"></i> ' : '';
    var removeIcon = ionic.Platform.isAndroid() ? '<i class="icon ion-trash-b"></i> ' : '';
    $ionicActionSheet.show({
       buttons: [
         { text: editIcon + 'Editar' }
       ],
       destructiveText: removeIcon + 'Eliminar',
       destructiveButtonClicked: function() {
        $rootScope.syncManager.tasks.deleteTask(item);

        return true;
       },
       titleText: 'Editar tarea',
       cancelText: 'Cancel',
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index) {
         if ( index == 0 ) {
          $rootScope.syncManager.tasks.openEditModal(item);
         }

         return true;
       }
     });
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