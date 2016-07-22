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


		this.getTimestamp = function() {
			var d = new Date();
			var timestamp = d.getTime();

			return timestamp;
		}

		this.db = {
			drop: function() {
				return $cordovaSQLite.execute($rootScope.database,  "DROP TABLE sync_tasks");
			},
			init: function() {
				$cordovaSQLite.execute($rootScope.database, 
		      "CREATE TABLE IF NOT EXISTS sync_tasks (title text, sync_hour integer, sync_minute integer, user_id integer, "
		      + "created_at integer)");
			}
		};


		this.tasks = {};

		this.tasks.isAdding = false;
		this.tasks.isEditing = true;

		this.tasks.newTask = {
			id: 0,
			title: '',
			hour: '',
			minute: '',
			created_at: 0
		};

		this.tasks.list = [];

		this.tasks.parseTime = function(str) {
			var splited = str.split(':');
			var hour = parseInt(splited[0]);
			var minute = parseInt(splited[1]);
			var a = 'am';
			var new_time = '';

			function pad(num, size) {
			    var s = num+"";
			    while (s.length < size) s = "0" + s;
			    return s;
			}

			if ( hour > 12 ) {
				hour -= 12;
				a = 'pm';
			}

			new_time = [pad(hour, 2), pad(minute, 2)].join(':');

			return new_time + ' ' + a;
		}

		this.tasks.all = function() {
			// _scope.db.drop();
			_scope.db.init();

			var user_id = $rootScope.user.user_id;

			return $cordovaSQLite.execute($rootScope.database,  "SELECT rowid,* FROM sync_tasks WHERE user_id = ?", [ user_id ] )
		}

		this.tasks.fetchAll = function(callback) {
			$rootScope.utils.backgroundLoading = true;
			this.all().then(function(res) {

	      var _tasks = [];

	      for (var i = 0; i < res.rows.length; i++) {
	        var item = {};
	        item.id = res.rows.item(i).rowid;
	        item.title = res.rows.item(i).title;
	        item.sync_hour = res.rows.item(i).sync_hour;
	        item.sync_minute = res.rows.item(i).sync_minute;
	        item.user_id = res.rows.item(i).user_id;

	        _tasks.push(item);
	      }

	      $rootScope.syncManager.tasks.list = _tasks;
	      $rootScope.utils.backgroundLoading = false;
	      // console.log(_tasks);

	      if ( typeof callback === "function" ) {
	      	callback.call(this);
	      }

	    }, function(err) {
	      console.log('ERROR', err);
	      $rootScope.utils.backgroundLoading = false;
	    });
		}

		this.tasks.remove = function(task) {
			return $cordovaSQLite.execute($rootScope.database,  
				"DELETE FROM sync_tasks WHERE rowid = ?", 
				[ task.id ] );
		}

		this.tasks.deleteTask = function(task) {
			var _tasks_scope = this;

			this.remove(task).then(function(res) {
				_tasks_scope.fetchAll();
			}, function(err) {
				console.log("ERROR", err);
			});
		}

		this.tasks.store = function(task) {
			var user_id = $rootScope.user.user_id;

			return $cordovaSQLite.execute($rootScope.database,  
				"INSERT INTO sync_tasks(title, sync_hour, sync_minute, user_id, created_at) VALUES(?,?,?,?,?)", 
				[ task.title, task.sync_hour, task.sync_minute, user_id, task.created_at ] );
		}

		this.tasks.update = function(task) {
			var user_id = $rootScope.user.user_id;

			return $cordovaSQLite.execute($rootScope.database,  
				"UPDATE sync_tasks SET title = ?, sync_hour = ?, sync_minute = ? WHERE rowid = ?", 
				[ task.title, task.sync_hour, task.sync_minute, task.id ] );
		}

		this.tasks.add = function() {
			$rootScope.utils.showAlert();
		}

		this.tasks.new = function() {
			$rootScope.newTaskModal.show();
			_scope.tasks.isAdding = true;
			_scope.tasks.isEditing = false;
		}

		this.tasks.openEditModal = function(task) {
			$rootScope.newTaskModal.show();
			_scope.tasks.isEditing = true;

			_scope.tasks.newTask.title = task.title;
			_scope.tasks.newTask.sync_hour = "" + task.sync_hour;
			_scope.tasks.newTask.sync_minute = "" + task.sync_minute;
			_scope.tasks.newTask.id = task.id;
		}

		this.tasks.resetForm = function() {
			_scope.tasks.isAdding = false;
			_scope.tasks.isEditing = false;
			_scope.tasks.newTask.id = 0;
			_scope.tasks.newTask.title = '';
			_scope.tasks.newTask.sync_hour = '';
			_scope.tasks.newTask.sync_minute = '';
			_scope.tasks.newTask.created_at = 0;

			$rootScope.newTaskModal.hide();
		}

		this.tasks.isColisioning = function(task) {
			var collisioning = false;

			for (var i = 0; i < this.list.length; i++) {
				if ( this.list[i].sync_hour == task.sync_hour 
					&& this.list[i].sync_minute == task.sync_minute ) {
					collisioning = true;
				}
			}

			return collisioning;
		}

		this.tasks.addTask = function() {
			var _tasks_scope = this;
			var _task = _scope.tasks.newTask;


			if ( _task.sync_hour == '' || _task.sync_minute == '' ) {
				$rootScope.utils.showAlert('Tarea', 'Por favor selecciona la hora y minuto en la que se debe realizar la tarea "' 
					+ (_task.title||'Sin titulo') + '".');

				return false;
			}

			if ( _tasks_scope.list.length > 4 ) {
				$rootScope.utils.showAlert('Alerta', 'No puedes tener mas de 5 tareas diarias, esto puede causar un consumo excesivo '
					+ 'de la vida de tu bateria, asi como tambien de datos.');

				return false;
			}


			_task.title = _task.title || 'Sin titulo';

			_task.created_at = _scope.getTimestamp();
			_task.user_id = $rootScope.user.user_id;

			if ( _tasks_scope.isColisioning(_task) ) {
				$rootScope.utils.showAlert('Alerta', 'Elije tareas con hora y minutos diferentes.');
				return false;
			}

			this.store(_task).then(function(res) {
				_tasks_scope.resetForm();
				_task.id = res.insertId;

				_tasks_scope.fetchAll();

				_scope.startBackgroundSyncing();

				console.log('TAREA AGREGADA');

			}, function(err) {
				console.log('ERROR', err);
			});

		}


		this.tasks.updateTask = function() {
			var _tasks_scope = this;
			var _task = _scope.tasks.newTask;


			if ( _task.sync_hour == '' || _task.sync_minute == '' ) {
				$rootScope.utils.showAlert('Tarea', 'Por favor selecciona la hora y minuto en la que se debe realizar la tarea "' 
					+ (_task.title||'Sin titulo') + '".');

				return false;
			}

			if ( _tasks_scope.isColisioning(_task) ) {
				$rootScope.utils.showAlert('Alerta', 'Elije tareas con hora y minutos diferentes.');
				return false;
			}

			_task.title = _task.title || 'Sin titulo';

			_task.created_at = _scope.getTimestamp();
			_task.user_id = $rootScope.user.user_id;

			this.update(_task).then(function(res) {
				_tasks_scope.resetForm();

				_tasks_scope.fetchAll();

				_scope.startBackgroundSyncing();

			}, function(err) {
				console.log('ERROR', err);
			});

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
	    	biu('Una sincronizacion esta en curso actualmente.', { type: 'success', alignBottom: true });
	    }

	  }

	  this.setBackgroundSyncing = function() {
	  	_scope.isBackgroundSyncing = true;
	  	_scope.isModalSync = false;

	  	if ( !_scope.isSyncing ) {
	    	_scope.syncAll();
	    }

	  	biu('La sincronizacion continuara en segundo plano.', { type: 'info', alignBottom: true });

	  	$rootScope.syncmodal.hide();
	  }


	  this.setViewSyncing = function() {
	  	_scope.isBackgroundSyncing = false;
	  	_scope.isModalSync = false;
	  }




	  this.backgroundSyncingQueue = [];

	  this.backgroundSyncQueueTimer;
	  this.lastBackgroundSync;

	  this.startBackgroundSyncing = function() {


	  	function oneTimePass() {

	  		var current_time = new Date();
	  		var current_hour = current_time.getHours();
	  		var current_minute = current_time.getMinutes();

	  		for (var i = 0; i < _scope.tasks.list.length; i++) {
	  			
	  			if ( _scope.tasks.list[i].sync_hour == current_hour && _scope.lastBackgroundSync != _scope.tasks.list[i].id ) {

	  				if ( _scope.tasks.list[i].sync_minute <= current_minute 
	  					&& _scope.tasks.list[i].sync_minute > (current_minute-11)
	  					&& $rootScope.user.auto_sync ) {

	  					_scope.isBackgroundSyncing = true;
					  	_scope.isModalSync = false;

					  	if ( !_scope.isSyncing ) {
					  		biu('Iniciando tarea de sincronizacion "'+_scope.tasks.list[i].title+'" ( ' 
					  			+ _scope.tasks.parseTime(_scope.tasks.list[i].sync_hour+':'+_scope.tasks.list[i].sync_minute) 
					  			+ ' ) ', { type: 'success', alignBottom: true });
					    	_scope.syncAll();
					    }

					    _scope.lastBackgroundSync = _scope.tasks.list[i].id;

	  				}

	  			}

	  		}

	  		if ( _scope.backgroundSyncQueueTimer != undefined ) {
	  			clearTimeout(_scope.backgroundSyncQueueTimer);
	  		}

	  		_scope.backgroundSyncQueueTimer = setTimeout(oneTimePass, (5 * 100) * 1000);
	  	}

	  	oneTimePass.call(this);

	  }



	}


	return new syncManager();


});