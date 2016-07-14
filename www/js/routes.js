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
      controller: "Clients",
      templateUrl: 'views/clients/index.html'
    })

    .state('clientes_busqueda', {
      url: "/clientes/buscar",
      controller: "ClientsSearch",
      templateUrl: 'views/clients/search.html'
    })

    .state('clientes_detalle', {
      url: "/clientes/cliente/:id",
      controller: "ClientDetails",
      templateUrl: 'views/clients/show.html'
    })

    .state('clientes_facturas', {
      url: "/clientes/cliente/:id/facturas",
      controller: "ClientReports",
      templateUrl: 'views/clients/facturas/index.html'
    })

    .state('clientes_facturas_detalle', {
      url: "/clientes/cliente/:id/facturas/:factura",
      controller: "ClientReportDetails",
      templateUrl: 'views/clients/facturas/show.html'
    })


    .state('inventario', {
      url: "/inventario",
      controller: "Inventory",
      templateUrl: 'views/inventario/index.html'
    })

    .state('inventario_busqueda', {
      url: "/inventario/buscar",
      controller: "InventorySearch",
      templateUrl: 'views/inventario/search.html'
    })

    .state('productos', {
      url: "/productos",
      controller: "Products",
      templateUrl: 'views/inventario/productos/index.html'
    })

    .state('productos_detalle', {
      url: "/productos/producto/:id",
      controller: "ProductDetails",
      templateUrl: 'views/inventario/productos/show.html'
    })

    .state('marcas', {
      url: "/marcas",
      controller: "Trademarks",
      templateUrl: 'views/inventario/marcas/index.html'
    })

    .state('marcas_detalle', {
      url: "/marcas/marca/:id",
      controller: "TrademarkDetails",
      templateUrl: 'views/inventario/marcas/show.html'
    })

    .state('categorias', {
      url: "/categorias",
      controller: "Categories",
      templateUrl: 'views/inventario/categorias/index.html'
    })

    .state('categorias_detalle', {
      url: "/categorias/categoria/:id",
      controller: "CategoryDetails",
      templateUrl: 'views/inventario/categorias/show.html'
    })


    .state('sync', {
      url: "/sync",
      controller: "SyncController",
      templateUrl: 'views/sincronizacion/index.html'
    })

    .state('sync_settings', {
      url: "/sync/settings",
      controller: "SyncController",
      templateUrl: 'views/sincronizacion/settings.html'
    })

    .state('sync_start', {
      url: "/sync/start",
      controller: "SyncController",
      templateUrl: 'views/sincronizacion/sync.html'
    });


  $urlRouterProvider.otherwise('/');



  $httpProvider.defaults.headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};

});