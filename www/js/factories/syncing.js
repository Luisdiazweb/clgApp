angular.module('clg.factories')
.factory('SyncManager', function($http, $state, $cordovaSQLite, $timeout, $rootScope) {

	function syncManager() {


		var _scope = this;


		this.isSyncing = false;
		this.isModalSync = false;
		this.isBackgroundSyncing = false;


		this.sync_catalogues = [];



		this.getMapping = function() {
			return _scope.sync_catalogues;
		}

		this.setMapping = function(mapping) {
			_scope.sync_catalogues = mapping;
			_scope.syncing.total = mapping.length;

			return _scope.getMapping();
		}





	//Start syncing all
	this.syncing = {
		current: 0,
		total: _scope.sync_catalogues.length,
		percent: 0
	};


	this.syncAll = function() {

		_scope.isSyncing = true;

		function setStep (numb) {
			var percent = 1;

			if ( numb < (_scope.syncing.total + 1) ) {
				percent = (100 / _scope.syncing.total) * (numb<_scope.syncing.total?numb/2:numb);
			}

			_scope.syncing.percent = percent;
			_scope.syncing.current = numb;
		}


		var _current = 0;
		function sync_now() {
			
			if ( !_scope.isBackgroundSyncing ) {
				$rootScope.utils.loading();
			}

			$rootScope.utils.sync_index = 0;

			if	( _current < _scope.syncing.total ) {
				
				setStep(_current + 1);


				_scope.sync_catalogues[_current].synced = 0;
				_scope.sync_catalogues[_current].synced_at = null;

				if ( _scope.sync_catalogues[_current].mapping ) {
					$http.get(_scope.sync_catalogues[_current].api_url)
			    	.then(function(response) {

			    		$rootScope.utils.loaded();

			    		_scope.sync_catalogues[_current].total_records = response.data.length;
			    		$rootScope.utils.sync_index = 1;

			    		_scope.sync_catalogues[_current].mapping.bulk_sync(response.data, _scope.sync_catalogues[_current].label, 
			    			function() {
			    				var _synced_at = (new Date()).getTime();

			    				_scope.sync_catalogues[_current].synced = 1;
			    				_scope.sync_catalogues[_current].synced_at = _synced_at;
			    				_scope.sync_catalogues[_current].synced_at_local = moment(_synced_at).fromNow();

				    			_current++;
				    			sync_now();
				    		}
			    		);


			    	}, function(err) {
			    		$rootScope.utils.showAlert("Algo salio mal.", 'El servidor no responde, probablemente se deba a un problema de red. '
			    			+ 'Porfavor intenta mas tarde.');
			    		$rootScope.utils.loaded();


			    		if ( err.status < 0 ) {
			    			// $rootScope.online = false;
			    		}

			    		// sync_now();
			    		if ( _scope.isModalSync ) {
			    			$rootScope.syncmodal.hide();
			    		} else if(_scope.isBackgroundSyncing) {
			    			_scope.isBackgroundSyncing = false;
			    		} else {
			    			$state.go("sync");
			    		}

			    		_scope.isSyncing = false;
			    		_scope.isModalSync = false;

			    	});

					} else {
						$rootScope.utils.loaded();
						_current++;
	    			sync_now();
					}

				} else {
					$rootScope.utils.loaded();

					if ( _scope.isBackgroundSyncing ) {
						biu('Sincronizacion realizada con exito!', { type: 'success', alignBottom: true });
					} else {
	    			$rootScope.utils.showAlert("Hecho", 'Sincronizacion realizada con exito.');
					}

	    		if ( _scope.isModalSync ) {
	    			$rootScope.syncmodal.hide();
	    		} else if( _scope.isBackgroundSyncing ) {
	    			//intentionally empty
	    		} else {
	    			$state.go("sync");
	    		}

    			_scope.isBackgroundSyncing = false;
	    		_scope.isSyncing = false;
	    		_scope.isModalSync = false;
				}
			} //end of sync_now




			$timeout(function() {
				setStep(1);

				_current = 0;
				sync_now();
			}, 500);


		}




		this.openSyncModal = function() {
	    $rootScope.syncmodal.show();

	    _scope.isBackgroundSyncing = false;

	    if ( !_scope.isSyncing ) {
	    	_scope.isModalSync = true;
	    	_scope.syncAll();
	    } else {
	    	biu('Una sincronizacion esta en curso actualmente.', { type: 'success' });
	    }

	  }

	  this.setBackgroundSyncing = function() {
	  	_scope.isBackgroundSyncing = true;
	  	_scope.isModalSync = false;

	  	if ( !_scope.isSyncing ) {
	    	_scope.syncAll();
	    }

	  	biu('La sincronizacion continuara en segundo plano.', { type: 'info' });

	  	$rootScope.syncmodal.hide();
	  }


	  this.setViewSyncing = function() {
	  	_scope.isBackgroundSyncing = false;
	  	_scope.isModalSync = false;
	  }



	}


	return new syncManager();


});