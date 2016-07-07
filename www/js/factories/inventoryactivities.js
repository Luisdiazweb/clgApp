
angular.module('clg.factories')
.factory('InventoryActivities', function() {

  return [
    {
      url: "#/productos",
      image: "img/product.png",
      title: "Productos",
      description: "Listado de productos y existencias"
    },
    {
      url: "#/marcas",
      image: "img/product.png",
      title: "Marcas",
      description: "Listado de productos y existencias"
    },
    {
      url: "#/categorias",
      image: "img/product.png",
      title: "Categorias",
      description: "Listado de productos y existencias"
    }
  ];
	

});