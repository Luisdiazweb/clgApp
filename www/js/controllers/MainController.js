
angular.module('clg.controllers')
.controller('MainController', function($scope, $rootScope, $state, $ionicSideMenuDelegate, $cordovaLocalNotification, 
  $timeout, $cordovaSQLite, ClientsFactory, ProductsFactory, AuthManager, Utilities, SideMenu, HomeActivities, 
  InventoryActivities, $http, $ionicModal, LoginManager) {

  $scope.contentLoaded = true;

  $rootScope.utils = Utilities;
  $rootScope.clientes = ClientsFactory.caching;
  $rootScope.inventario = ProductsFactory.caching;

  //Define api endpoints
  $rootScope.api = {
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
  };
	
	//sideMenu
	$scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  //menu items
  $rootScope.SideMenu = SideMenu;
  $rootScope.homeActivities = HomeActivities;
  $rootScope.inventoryActivities = InventoryActivities;

  //Manage user session
  $rootScope.user = AuthManager;



  //Manage Syncing
  $rootScope.Catalogos = {
    Clientes: ClientsFactory,
    Productos: ProductsFactory
  };

  $rootScope.sync_catalogues = [
    {
      icon: 'ion-person-stalker',
      label: 'Clientes',
      mapping: $rootScope.Catalogos.Clientes,
      api_url: $rootScope.api.clients_url(),
      total_records: '?',
      synced: 0,
      synced_at: null,
      synced_at_local: ''
    },
    {
      icon: 'ion-cube',
      label: 'Productos',
      mapping: $rootScope.Catalogos.Productos,
      api_url: $rootScope.api.products_url(),
      total_records: '?',
      synced: 0,
      synced_at: null,
      synced_at_local: ''
    }

  ];

  moment.locale('es');

  $rootScope.utils.loading();

  if (!Date.now) {
      Date.now = function() { return new Date().getTime(); }
  }

  $rootScope.loginmodal;

  //modal login
  $ionicModal.fromTemplateUrl('views/modallogin.html', {
    scope: $scope
  }).then(function(modal) {
    $rootScope.loginmodal = modal;
  });

  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $rootScope.loginmodal.remove();
    consolel.log('removing?');
  });

   // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action

    console.log('hidding');
    if ( !$rootScope.user.isLogged() ) {
      event.preventDefault();

      $rootScope.loginmodal.show();
      console.log('trying to re-open');
    }
  });





  $rootScope.loginmanager = new LoginManager($rootScope);






  $scope.readyQueue = [];

  $scope.listenAction = function(test) {
    // console.log('listening action');
    $timeout(function() {
      if ( !test.call(this) ) {
        $scope.listenAction.call(this, test);
      } else {
        // console.log('action is ok');
      }
    }, 100);
  }




  //stored avriable for last online status
  $rootScope.last_was_online = true;
  
  $scope.$watch('deviceReady', function(isReady) {
    if ( isReady ) {
      if ( !$rootScope.online ) {
        biu("No se ha detectado conexion de red, la aplicacion cambiara a modo offline.", {type: 'danger'});
      }

      $http.get('http://dccolorweb.com/experiments/clg/endpoints/user_login.php').then(function() {
        $rootScope.online = true;
      }, function() {
        $rootScope.online = false;
      });


      for (var i = 0; i < $scope.readyQueue.length; i++) {
        $scope.readyQueue[i].call(this);
      }
    }
  });


  $scope.$watch('online', function(newStatus) {

    if ( newStatus == $rootScope.last_was_online || !$rootScope.deviceReady ) {
      return false;
    }

    if ( newStatus == false ) {
      biu("No se ha detectado conexion de red, la aplicacion cambiara a modo offline.", {type: 'danger'});
    } else {
      biu("Conexion detectada, modo offline apagado.", {type: 'success'});
    }

    $rootScope.last_was_online = newStatus;
  });

  //prevent loading
  $rootScope.$on('$stateChangeStart', 
  function(event, toState, toParams, fromState, fromParams, options){ 
  	var cancel = false;

    function showLoginModal() {
      $scope.listenAction(function() {
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

        console.log('redirect to login?');

        if ( !$rootScope.deviceReady ) {

          $scope.readyQueue.push(function() {
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

    $rootScope.utils.loaded();

  });

});