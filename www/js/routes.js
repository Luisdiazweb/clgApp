angular.module('clg.config')
.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $stateProvider

    .state('index', {
      url: "/",
      controller: "LoginController",
      templateUrl: 'views/login.html'
    })

    .state('logout', {
      url: "/logout",
      controller: "LogoutController",
      templateUrl: 'views/login.html'
    })

    .state('home', {
      url: "/home",
      controller: "HomeController",
      templateUrl: 'views/home.html'
    })

    .state('clientes', {
      url: "/clientes",
      controller: "ClientsController",
      templateUrl: 'views/clients/index.html'
    })

    .state('clientes_busqueda', {
      url: "/clientes/buscar",
      controller: "ClientsSearchController",
      templateUrl: 'views/clients/search.html'
    })

    .state('clientes_detalle', {
      url: "/clientes/cliente/:id",
      controller: "ClientsController",
      templateUrl: 'views/clients/details.html'
    })

    .state('clientes_facturas', {
      url: "/clientes/cliente/:id/facturas",
      controller: "ClientsController",
      templateUrl: 'views/clients/facturas/index.html'
    })

    .state('clientes_facturas_detalle', {
      url: "/clientes/cliente/:id/facturas/:factura",
      controller: "ClientsController",
      templateUrl: 'views/clients/facturas/details.html'
    })


    .state('sync', {
      url: "/sync",
      controller: "SyncController",
      templateUrl: 'views/sync.html'
    })

    .state('sync_start', {
      url: "/sync/start",
      controller: "SyncController",
      templateUrl: 'views/sync.start.html'
    });


  $urlRouterProvider.otherwise('/');





  $httpProvider.defaults.headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};

});