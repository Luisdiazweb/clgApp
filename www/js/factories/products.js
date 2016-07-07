
angular.module('clg.factories')
.factory('ProductsFactory', function($rootScope, $state, $cordovaSQLite, $timeout) {

	var _productFactory = {
		caching: {
			productos: {
				pagina_actual: 1,
				resultados: {},
				actual: {}
			},
			marcas: {
				pagina_actual: 1,
				resultados: {},
				actual: {},
				productos: {
					pagina_actual: 1,
					resultados: {}
				}
			},
			categorias: {
				pagina_actual: 1,
				resultados: {},
				actual: {},
				productos: {
					pagina_actual: 1,
					resultados: {}
				}
			},
			busqueda: {
				resultados: {},
				pagina_actual: 1
			}, 
			routing: {
				base: function() {
					return '#/inventario';
				},
				search: function() {
					return [this.base(), 'buscar'].join('/');
				},
				producto: function(id) {
					return ["#", "productos", 'producto', id].join('/');
				},
				marca: function(id) {
					if ( id ) {
						return ["#", "marcas", 'marca', Base64.encode(id.toUpperCase())].join('/');
					}

					return ["#", "marcas", "marca"].join("/");
				},
				categoria: function(id) {
					return ["#", "categorias", 'categoria', id].join('/');
				}
			}
		},

		check_syncing: function(returningCallback) {
			 var query = "SELECT * FROM syncs WHERE module = ? ORDER BY id DESC";

      $cordovaSQLite.execute($rootScope.database, query, ["Maestro_Productos"]).then(function(res) {
        if(res.rows.length > 0) {
            returningCallback.call(this, res.rows.item(0).synced_at);
        } else {
            // $scope.createLocalLogin(user, successCallback, errorCallback);
            returningCallback.call(this, null);
        }
      }, function (err) {
          // $rootScope.showAlert("Error", "No se pudo guardar la sesion. - " + err);
          returningCallback.call(this, null);
      });
		},

		products: {
			find: function(id) {
				var query = "SELECT * FROM Maestro_Productos WHERE ProductoCodigo LIKE ?";
	      return $cordovaSQLite.execute($rootScope.database, query, ["%" + id + "%"]);
			},

			page: function(num) {
				var limit = 0;
				if ( num != undefined && num > 0 ) {
					num = num - 1;
					limit = (num*10) + ",10"
				}

				var query = "SELECT * FROM Maestro_Productos limit " + limit;
	      return $cordovaSQLite.execute($rootScope.database, query, []);
			}
		},

		trademarks: {
			find: function(id, num) {

				var limit = 0;
				if ( num != undefined && num > 0 ) {
					num = num - 1;
					limit = (num*10) + ",10"
				}

				id = Base64.decode(id);

				var query = "SELECT * FROM Maestro_Productos WHERE Fabricante LIKE ? limit " + limit;
	      return $cordovaSQLite.execute($rootScope.database, query, ["%" + id + "%"]);
			},

			page: function(num) {
				var limit = 0;
				if ( num != undefined && num > 0 ) {
					num = num - 1;
					limit = (num*10) + ",10"
				}

				var query = "SELECT DISTINCT Fabricante FROM Maestro_Productos limit " + limit;
	      return $cordovaSQLite.execute($rootScope.database, query, []);
			}
		},

		categories: {
			find: function(id, num) {

				var limit = 0;
				if ( num != undefined && num > 0 ) {
					num = num - 1;
					limit = (num*10) + ",10"
				}

				var query = "SELECT * FROM Maestro_Productos WHERE TipoCodigo = ? limit " + limit;
	      return $cordovaSQLite.execute($rootScope.database, query, [id]);
			},

			page: function(num) {
				var limit = 0;
				if ( num != undefined && num > 0 ) {
					num = num - 1;
					limit = (num*10) + ",10"
				}

				var query = "SELECT DISTINCT TipoCodigo, TipoDescripcion FROM Maestro_Productos limit " + limit;
	      return $cordovaSQLite.execute($rootScope.database, query, []);
			}
		},

		search: function(search_query, num) {
			var limit = 0;
			if ( num != undefined && num > 0 ) {
				num = num - 1;
				limit = (num*10) + ",10"
			}

			var query = "SELECT * FROM Maestro_Productos WHERE ClienteNombre LIKE ? GROUP BY ClienteCodigo limit " + limit;
      return $cordovaSQLite.execute($rootScope.database, query, ['%' + search_query + '%']);
		},


		db: {
			drop: function() {
				$cordovaSQLite.execute($rootScope.database,  "DROP TABLE Maestro_Productos");
			},
			init: function() {
				$cordovaSQLite.execute($rootScope.database, 
		      "CREATE TABLE IF NOT EXISTS Maestro_Productos (TipoCodigo integer, TipoDescripcion text, ProductoCodigo text, "
		      + "Fabricante text, ProductoDescripcion text, Precio1 real, Precio2 real, Precio3 real, Precio4 real, "
		      + "Precio5 real, Existencias integer, CostoUnitario real, CostoTotal real)");
			},
			initSyncs: function() {
				$cordovaSQLite.execute($rootScope.database, 
		      "CREATE TABLE IF NOT EXISTS syncs (id integer primary key, module text, label text, "
		      + "synced_at integer)");
			}
		},

		bulk_sync: function(data, label, returningCallback) {
			
			this.db.drop();
			this.db.init();

			

      var _i = 0;

			function injectProduct() {

				$rootScope.sync_index = _i + 1;

				if (_i < data.length) {
				
					var product = data[_i];

					 var query = "INSERT INTO Maestro_Productos (TipoCodigo, TipoDescripcion, ProductoCodigo, "
			      + "Fabricante, ProductoDescripcion, Precio1, Precio2, Precio3, Precio4, "
			      + "Precio5, Existencias, CostoUnitario, CostoTotal) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
		        $cordovaSQLite.execute($rootScope.database, query, 
		        	[
		        		product.TipoCodigo, 
		        		product.TipoDescripcion, 
		        		product.ProductoCodigo,
		        		product.Fabricante,
		        		product.ProductoDescripcion,
		        		product.Precio1,
		        		product.Precio2,
		        		product.Precio3,
		        		product.Precio4,
		        		product.Precio5,
		        		product.Existencias,
		        		product.CostoUnitario,
		        		product.CostoTotal
		        		])
		        .then(function(res) {
		          
		          _i++;
		          $timeout(injectProduct, 10);

				    }, function (err) {
			        // re-try
			        console.log("ESQUE OCURRIO ERROR", err);
		          $timeout(injectProduct, 10);
				    });

				} else {

					var d = new Date();
					var timestamp = d.getTime();
					var query = "INSERT INTO syncs (module, label, synced_at) VALUES (?,?,?)";
	        $cordovaSQLite.execute($rootScope.database, query, 
	        	["Maestro_Productos", label, timestamp] )
	        .then(function(res) {
	          
	          returningCallback.call(this);

			    }, function (err) {
		        // re-try
		        injectProduct();
			    });

				}

			}

			injectProduct();


		}
	};


	var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};


	return _productFactory;


	

});