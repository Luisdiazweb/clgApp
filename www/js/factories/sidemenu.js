
angular.module('clg.factories')
.factory('SideMenu', function() {

	return [
    {
      title: "Clientes",
      url: "#/clientes"
    },
    {
      title: "Products",
      url: "#/products"
    },
    {
      title: "Sincronizacion",
      url: "#/sync"
    },
    {
      title: "Salir",
      url: "#/logout"
    }
  ];
	

});