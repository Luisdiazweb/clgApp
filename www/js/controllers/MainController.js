
angular.module('clg.controllers')
.controller('MainController', function($scope, $rootScope, $state, $ionicSideMenuDelegate, $cordovaLocalNotification, 
  $timeout, $cordovaSQLite, ClientsFactory, ProductsFactory, AuthManager, Utilities, SideMenu, HomeActivities, 
  InventoryActivities, $http, $ionicModal, LoginManager, SyncManager) {

  $rootScope.contentLoaded = true;
  moment.locale('es');

  $rootScope.utils = Utilities;
  $rootScope.clientes = ClientsFactory.caching;
  $rootScope.inventario = ProductsFactory.caching;

  //Define api endpoints
  $rootScope.api = $rootScope.utils.apiEndpoints;
  $rootScope.toggleLeft = $rootScope.utils.toggleLeft;

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


  $rootScope.utils.loading();


  $rootScope.loginmodal;
  $ionicModal.fromTemplateUrl('views/modallogin.html', {
    scope: $scope,
    backdropClickToClose: false
  }).then(function(modal) {
    $rootScope.loginmodal = modal;
  });

  $rootScope.loginmanager = new LoginManager($rootScope);


  $rootScope.syncmodal;
  $ionicModal.fromTemplateUrl('views/sincronizacion/modal.html', {
    scope: $rootScope,
    backdropClickToClose: false
  }).then(function(modal) {
    $rootScope.syncmodal = modal;
  });

 $rootScope.newTaskModal;
  $ionicModal.fromTemplateUrl('views/sincronizacion/newTask.html', {
    scope: $scope,
    backdropClickToClose: false
  }).then(function(modal) {
    $rootScope.newTaskModal = modal;
  });

  $rootScope.syncManager = SyncManager;
  $rootScope.sync_catalogues = $rootScope.syncManager.setMapping([
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
    ]);

 

  $rootScope.readyQueue = [];
  $rootScope.dispatchNow = $rootScope.utils.dispatchNow;


  //stored avriable for last online status
  $rootScope.last_was_online = true;
  //device ready listener
  $rootScope.$watch('deviceReady', $rootScope.utils.deviceReadyListener);
  //listen online status
  $rootScope.$watch('online', $rootScope.utils.onlineStatusListener);
  //prevent loading
  $rootScope.$on('$stateChangeStart', $rootScope.utils.stateChangeListener);
  //auto-sync settings change
  $rootScope.$watch('user.auto_sync', $rootScope.user.syncStatusChange);

});