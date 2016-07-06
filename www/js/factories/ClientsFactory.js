
angular.module('clg.factories')
.factory('ClientsFactory', function($rootScope, $state, $cordovaSQLite, $timeout) {

	return {
		caching: {
			pagina_actual: 1,
			todos: {},
			busqueda: {
				resultados: {},
				pagina_actual: 1
			}, 
			routing: {
				base: function() {
					return '#/clientes';
				},
				search: function() {
					return [this.base(), 'buscar'].join('/');
				},
				cliente: function(id) {
					return [this.base(), 'cliente', id].join('/');
				},
				facturas: function(cliente) {
					return [this.cliente(cliente), "facturas"].join('/');
				},
				factura: function(cliente, factura) {
					return [this.facturas(cliente), factura].join('/');
				}
			},
			actual: {
				datos: {},
				facturas: {
					actual: {},
					ultimas: [],
					pagina_actual: 1,
					todas: {}
				}
			}
		},

		check_syncing: function(returningCallback) {
			 var query = "SELECT * FROM syncs WHERE module = ? ORDER BY id DESC";

      $cordovaSQLite.execute($rootScope.database, query, ["Cartera_Clientes"]).then(function(res) {
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

		all: function() {
			var query = "SELECT * FROM Cartera_Clientes";
      return $cordovaSQLite.execute($rootScope.database, query, []);
		},

		find: function(id) {
			var query = "SELECT * FROM Cartera_Clientes WHERE ClienteCodigo = ?";
      return $cordovaSQLite.execute($rootScope.database, query, [id]);
		},

		factura: function(id, factura) {
			var query = "SELECT * FROM Cartera_Clientes WHERE NumeroFactura = ?";
      return $cordovaSQLite.execute($rootScope.database, query, [factura]);
		},

		facturas: function(id, limit) {

			limit = limit != undefined ? " limit 0, " + limit : "";

			var query = "SELECT * FROM Cartera_Clientes WHERE ClienteCodigo = ?" + limit;
      return $cordovaSQLite.execute($rootScope.database, query, [id]);
		},

		facturas_paged: function(id, num) {

			var limit = 0;
			if ( num != undefined && num > 0 ) {
				num = num - 1;
				limit = (num*10) + ",10"
			}

			var query = "SELECT * FROM Cartera_Clientes WHERE ClienteCodigo = ? limit " + limit;
      return $cordovaSQLite.execute($rootScope.database, query, [id]);
		},

		page: function(num) {
			var limit = 0;
			if ( num != undefined && num > 0 ) {
				num = num - 1;
				limit = (num*10) + ",10"
			}

			var query = "SELECT * FROM Cartera_Clientes GROUP BY ClienteCodigo limit " + limit;
      return $cordovaSQLite.execute($rootScope.database, query, []);
		},

		search: function(search_query, num) {
			var limit = 0;
			if ( num != undefined && num > 0 ) {
				num = num - 1;
				limit = (num*10) + ",10"
			}

			var query = "SELECT * FROM Cartera_Clientes WHERE ClienteNombre LIKE ? GROUP BY ClienteCodigo limit " + limit;
      return $cordovaSQLite.execute($rootScope.database, query, ['%' + search_query + '%']);
		},


		db: {
			drop: function() {
				$cordovaSQLite.execute($rootScope.database,  "DROP TABLE Cartera_Clientes");
			},
			init: function() {
				$cordovaSQLite.execute($rootScope.database, 
		      "CREATE TABLE IF NOT EXISTS Cartera_Clientes (Periodo integer, Departamento text, Municipio text, NumeroFactura integer, "
		      + "Vendedor text, ClienteCodigo text, ClienteNombre text, RangoPeriodo text, TotalFactura real, "
		      + "Cantidad_Abonada real, Total real)");
			}
		},

		bulk_sync: function(data, label, returningCallback) {
			
			this.db.drop();
			this.db.init();

			

      var _i = 0;

			function injectClient() {

				$rootScope.sync_index = _i + 1;

				if (_i < data.length) {
				
					var client = data[_i];

					 var query = "INSERT INTO Cartera_Clientes (Periodo, Departamento, Municipio, NumeroFactura, "
	      		+ "Vendedor, ClienteCodigo, ClienteNombre, RangoPeriodo, TotalFactura, "
	      		+ "Cantidad_Abonada, Total) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
		        $cordovaSQLite.execute($rootScope.database, query, 
		        	[
		        		client.Periodo, 
		        		client.Departamento, 
		        		client.Municipio,
		        		client.NumeroFactura,
		        		client.Vendedor,
		        		client.ClienteCodigo,
		        		client.ClienteNombre,
		        		client.RangoPeriodo,
		        		client.Total_Factura,
		        		client.Cantidad_Abonada,
		        		client.Total
		        		])
		        .then(function(res) {
		          
		          _i++;
		          $timeout(injectClient, 10);

				    }, function (err) {
			        // re-try
			        console.log("ESQUE OCURRIO ERROR", err);
		          $timeout(injectClient, 10);
				    });

				} else {

					var d = new Date();
					var timestamp = d.getTime();
					var query = "INSERT INTO syncs (module, label, synced_at) VALUES (?,?,?)";
	        $cordovaSQLite.execute($rootScope.database, query, 
	        	["Cartera_Clientes", label, timestamp] )
	        .then(function(res) {
	          
	          returningCallback.call(this);

			    }, function (err) {
		        // re-try
		        injectClient();
			    });

				}

			}

			injectClient();


		}
	};
	

});