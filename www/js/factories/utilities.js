
angular.module('clg.factories')
.factory('Utilities', function($ionicPopup, $ionicLoading, $ionicSideMenuDelegate, $state, $http, $timeout, $rootScope) {

	function Utilities() {
		var _scope = this;

		this.checkedAuth = false;
	  this.checkedModuleTables = false;
	  this.checkedSyncing = false;
	  this.sync_index = 0;
	  this.back_to = { name: "", params: {} };
	  this.backgroundLoading = false;
	  this.isLoading = false;

	  this.navBarClass = 'bar-light';

	  this.checkDBSupport = function() {
	  	if ( $rootScope.database == "NOT_SUPPORTED" ) {
	      _scope.showAlert("Notificacion de la aplicacion", 'Esta simulacion no funcionara debido a que el navegador '
	          + 'no soporta las tecnologias necesaria.');

	      _scope.loaded();

	      return false;
	    }

	    return true;
	  }

	  //define a server error when endpoints fails
	  this.showAlert = function(title, message) {

	    var alert_defaults = {
	      title: 'Algo esta mal.',
	      message: 'Porfavor intenta mas tarde.'
	    };

	    var serverErrorPop = $ionicPopup.alert({
	     title: _scope.get_variable(title, alert_defaults.title),
	     template: _scope.get_variable(message, alert_defaults.message)
	    });

	  }

	  //default value
	  this.get_variable = function(variable, default_value) {
	    if ( variable ) {
	      return variable;
	    }

	    return default_value;
	  }


	  //Show a Loading Message when ajax is performing
	  this.loading = function() {
	  	_scope.isLoading = true;
	    $ionicLoading.show({
	      template: '<ion-spinner></ion-spinner>'
	    });
	  };


	  //hide Loading Message after ajax is performed
	  this.loaded = function(){
	  	_scope.isLoading = false;

	    $ionicLoading.hide();
	  };

	  this.dispatchNow = function(test) {
	    // console.log('listening action');
	    $timeout(function() {
	      if ( !test.call(this) ) {
	        $rootScope.dispatchNow.call(this, test);
	      } else {
	        // console.log('action is ok');
	      }
	    }, 100);
	  }



	  this.stateChangeListener = function(event, toState, toParams, fromState, fromParams, options){ 
	  	var cancel = false;

	    function showLoginModal() {
	      $rootScope.dispatchNow(function() {
	        if ( $rootScope.loginmodal ) {
	          $rootScope.loginmodal.show();

	          $rootScope.loginmanager.checkIfWasAuth();
	        }

	        return $rootScope.loginmodal;
	      });
	    }



	    if ( $ionicSideMenuDelegate.isOpen() ) {
	      $ionicSideMenuDelegate.toggleLeft();
	    }

	    if (!$rootScope.utils.checkDBSupport()) {

	      $rootScope.user.logoutUser();

	      $state.go("index");
	      
	      event.preventDefault();

	      return false;
	    }

	    angular.element(document.body).removeClass("is-search is-subheader");
	    
	    if ( toState.name == "clientes_busqueda" 
	      || toState.name == "marcas_detalle"
	      || toState.name == "inventario_busqueda"
	      || toState.name == "categorias_detalle" ) {
	      angular.element(document.body).addClass("is-search is-subheader");
	    }

	    if ( toState.name == "logout" && !$rootScope.user.isLogged() ) {
	      cancel = true;
	    }

	    if ( toState.name != 'index' && !$rootScope.user.isLogged() ) {
	    	cancel = true;
	    }

	    if ( cancel ) {
	    	event.preventDefault();

	      $rootScope.utils.back_to.name = toState.name;
	      $rootScope.utils.back_to.params = toParams;

	    	if ( fromState.name != 'index' ) {
	    		// $state.go('index');

	        // console.log('redirect to login?');

	        if ( !$rootScope.deviceReady ) {

	          $rootScope.readyQueue.push(function() {
	            showLoginModal();
	          });

	        } else {
	          showLoginModal();
	        }
	    	}
	    } else {

	      if ( $rootScope.user.isLogged() && toState.name == "index" ) {
	        event.preventDefault();

	        $state.go("home");
	      }


	    }


	    if ( toState.name != 'sync_start' ) {
	    	if ( $rootScope.syncManager.isSyncing && !$rootScope.syncManager.isBackgroundSyncing ) {
	    		$rootScope.syncManager.setBackgroundSyncing();
	    	}
	    } else {
	    	if ( $rootScope.syncManager.isSyncing ) {
	    		$rootScope.syncManager.setViewSyncing();
	    	}
	    }

	    $rootScope.utils.loaded();

	  }



	  this.range = function(min, max, step) {
	  	 step = step || 1;
		    var input = [];
		    for (var i = min; i <= max; i += step) {
		        input.push(i);
		    }
		    return input;
	  }





	  this.onlineStatusListener = function(newStatus) {
	    if ( newStatus == $rootScope.last_was_online || !$rootScope.deviceReady ) {
	      return false;
	    }

	    if ( newStatus == false ) {
	      biu("No se ha detectado conexion de red, la aplicacion cambiara a modo offline.", {type: 'danger'});
	    } else {
	      biu("Conexion detectada, modo offline apagado.", {type: 'success'});
	    }

	    $rootScope.last_was_online = newStatus;
	  }



	  this.deviceReadyListener = function(isReady) {
	    if ( isReady ) {
	      if ( !$rootScope.online ) {
	        biu("No se ha detectado conexion de red, la aplicacion cambiara a modo offline.", {type: 'danger'});
	      }

	      $http.get('http://dccolorweb.com/experiments/clg/endpoints/user_login.php').then(function() {
	        $rootScope.online = true;
	      }, function() {
	        $rootScope.online = false;
	      });


	      for (var i = 0; i < $rootScope.readyQueue.length; i++) {
	        $rootScope.readyQueue[i].call(this);
	      }

	    }
	  }




	  this.apiEndpoints = {
	    root_url: "http://dccolorweb.com/experiments/clg/endpoints/",
	    login_url: function() {
	      var login_url = "user_login.php";
	      return this.root_url + login_url;
	    },
	    clients_url: function() {
	      var clients_url = "clients.php";
	      return this.root_url + clients_url;
	    },
	    products_url: function() {
	      var products_url = "products.php";
	      return this.root_url + products_url;
	    }
	  }




	  this.toggleLeft = function() {
		  $ionicSideMenuDelegate.toggleLeft();
		}


		this.continueAsBackground = function() {
			$rootScope.syncManager.setBackgroundSyncing();
		}


	}

	return new Utilities();
	

});