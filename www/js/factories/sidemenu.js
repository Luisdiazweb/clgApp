
angular.module('clg.factories')
.factory('SideMenu', function() {

	return [
    {
      title: "Inicio",
      url: "#/home",
      classes: 'item-positive'
    },
    {
      title: "Clientes",
      url: "#/clientes",
      classes: ''
    },
    {
      title: "Inventario",
      url: "#/inventario",
      classes: ''
    },
    {
      title: "CONFIGURACION",
      url: "javascript:;",
      classes: 'item-divider'
    },
    {
      title: "Sincronizacion",
      url: "#/sync",
      classes: ''
    },
    {
      title: "Cerrar sesion",
      url: "#/logout",
      classes: ''
    }
  ];
	

});