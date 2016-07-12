
angular.module('clg.factories')
.factory('SideMenu', function() {

	return [
    {
      title: "Inicio",
      url: "#/home"
    },
    {
      title: "Clientes",
      url: "#/clientes"
    },
    {
      title: "Inventario",
      url: "#/inventario"
    },
    {
      title: "Sincronizacion",
      url: "#/sync"
    },
    {
      title: "Cerrar sesion",
      url: "#/logout"
    }
  ];
	

});