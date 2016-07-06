
angular.module('clg.controllers')
.controller('MainController', function($scope, $rootScope, $state, $ionicSideMenuDelegate, $ionicLoading, $cordovaLocalNotification,
  $ionicPopup, $timeout, $cordovaSQLite, ClientsFactory, AuthManager) {


  $rootScope.checkedAuth = false;
  $rootScope.checkedModuleTables = false;
  $rootScope.checkedSyncing = false;
  $rootScope.sync_index = 0;
  $scope.contentLoaded = true;
  $rootScope.back_to = { name: "", params: {} };

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

  //define a server error when endpoints fails
  $rootScope.showAlert = function(title, message) {

    var alert_defaults = {
      title: 'Algo esta mal.',
      message: 'Porfavor intenta mas tarde.'
    };

    var serverErrorPop = $ionicPopup.alert({
     title: $rootScope.get_variable(title, alert_defaults.title),
     template: $rootScope.get_variable(message, alert_defaults.message)
    });

  }

  //default value
  $rootScope.get_variable = function(variable, default_value) {
    if ( variable ) {
      return variable;
    }

    return default_value;
  }
	
	//sideMenu
	$scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };


  //Show a Loading Message when ajax is performing
  $rootScope.loading = function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    });
  };


  //hide Loading Message after ajax is performed
  $rootScope.loaded = function(){
    $ionicLoading.hide();
  };


  //left menu items
  $scope.leftMenuItems = [
    {
      title: "Sincronizacion",
      url: "#/sync"
    },
    {
      title: "Salir",
      url: "#/logout"
    }
  ];






  //Manage user session
  $rootScope.user = AuthManager;



  //Manage Syncing
  $rootScope.Catalogos = {
    Clientes: ClientsFactory,
    facturas: {
      synced: false,
      data: []
    },
    productos: {
      synced: false,
      data: []
    },
    marcas: {
      synced: false,
      data: []
    },
    categorias: {
      synced: false,
      data: []
    }
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
      mapping: '',
      api_url: $rootScope.api.products_url(),
      total_records: '?',
      synced: 0,
      synced_at: null,
      synced_at_local: ''
    }

  ];

  moment.locale('es');



  $rootScope.loading();


  if (!Date.now) {
      Date.now = function() { return new Date().getTime(); }
  }




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

      $rootScope.back_to.name = toState.name;
      $rootScope.back_to.params = toParams;

    	if ( fromState.name != 'index' ) {
    		$state.go('index');
    	}
    } else {

      if ( $rootScope.user.isLogged() && toState.name == "index" ) {
        event.preventDefault();

        $state.go("home");
      }

    }

    $rootScope.loaded();

  });

});