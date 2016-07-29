
angular.module('clg.factories')
.factory('SideMenu', function() {

	return [
    {
      title: "Inicio",
      route: "home",
      classes: 'item-stable'
    },
    {
      title: "Clientes",
      route: "clientes",
      classes: ''
    },
    {
      title: "Inventario",
      route: "inventario",
      classes: ''
    },
    {
      title: "CONFIGURACION",
      url: "javascript:;",
      route: 'sync',
      classes: 'item-divider'
    },
    {
      title: "Sincronizacion",
      route: "sync",
      classes: ''
    },
    {
      title: "Cerrar sesion",
      route: "logout",
      classes: ''
    }
  ];
	

});