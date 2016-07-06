
angular.module('clg.controllers')
.controller('MainController', function($scope, $rootScope, $state, $ionicSideMenuDelegate, $cordovaLocalNotification, 
  $timeout, $cordovaSQLite, ClientsFactory, ProductsFactory, AuthManager, Utilities, SideMenu) {

  $scope.contentLoaded = true;

  $rootScope.utils = Utilities;
  $rootScope.clientes = ClientsFactory.caching;

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

  //left menu items
  $scope.SideMenu = SideMenu;

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


  //stored avriable for last online status
  $rootScope.last_was_online = true;
  
  $scope.$watch('deviceReady', function(isReady) {
    if ( isReady ) {
      if ( !$rootScope.online ) {
        biu("Your device has not data conection right now, the app will run in offline mode.", {type: 'danger'});
      }
    }
  });


  $scope.$watch('online', function(newStatus) {

    if ( newStatus == $rootScope.last_was_online || !$rootScope.deviceReady ) {
      return false;
    }

    if ( newStatus == false ) {
      biu("Your device has not data conection right now, the app will run in offline mode.", {type: 'danger'});
    } else {
      biu("Data conection detected, online mode is on.", {type: 'success'});
    }

    $rootScope.last_was_online = newStatus;
  });

  //prevent loading
  $rootScope.$on('$stateChangeStart', 
  function(event, toState, toParams, fromState, fromParams, options){ 
  	var cancel = false;

    if ( $ionicSideMenuDelegate.isOpen() ) {
      $ionicSideMenuDelegate.toggleLeft();
    }

    angular.element(document.body).removeClass("is-search");
    if ( toState.name == "clientes_busqueda" ) {
      angular.element(document.body).addClass("is-search");
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
    		$state.go('index');
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