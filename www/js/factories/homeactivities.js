
angular.module('clg.factories')
.factory('HomeActivities', function() {

  return [
    {
      url: "#/clientes",
      image: "img/client.png",
      title: "Clientes",
      description: "Listado de clientes y facturas"
    },
    {
      url: "#/inventario",
      image: "img/product.png",
      title: "Inventario",
      description: "Listado de productos y existencias"
    }
  ];
	

});