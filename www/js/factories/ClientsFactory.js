
angular.module('clg.factories')
.factory('ClientsFactory', function($rootScope, $state, $cordovaSQLite, $timeout) {

	return {
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

		bulk_sync: function(data, label, returningCallback) {
			$cordovaSQLite.execute($rootScope.database,  "DROP TABLE Cartera_Clientes");

			$cordovaSQLite.execute($rootScope.database, 
      "CREATE TABLE IF NOT EXISTS Cartera_Clientes (Periodo integer, Departamento text, Municipio text, NumeroFactura integer, "
      + "Vendedor text, ClienteCodigo text, ClienteNombre text, RangoPeriodo text, TotalFactura real, "
      + "Cantidad_Abonada real, Total real)");

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
		          $timeout(injectClient, 100);

				    }, function (err) {
			        // re-try
			        console.log("ESQUE OCURRIO ERROR", err);
		          $timeout(injectClient, 100);
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