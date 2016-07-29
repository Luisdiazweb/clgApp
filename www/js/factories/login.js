angular.module('clg.factories')
.factory('LoginManager', function($http, $state, $cordovaSQLite, $timeout) {

	function loginManager($rootScope) {


		var _scope = this;

		//Manage the login data model
		_scope.loginData = {
			email: "",
			password: ""
		};


	  /*
	  * Create a user in the local Database if not exists to save sessions
	  *
	  * @param user {object} is the user object containg user information
	  */
	  _scope.createLocalLogin = function(user, successCallback, errorCallback) {
	    var query = "INSERT INTO users (email, name, password, is_logged, auto_sync) VALUES (?,?,?,?,?)";
	        $cordovaSQLite.execute($rootScope.database, query, [user.email, user.name, user.password, 1, 1]).then(function(res) {
	          successCallback.call(this, res.insertId);
	    }, function (err) {
	        $rootScope.utils.showAlert("Error", "No se pudo guardar la sesion. - " + err);
	    });
	  }

	  //Update a loggin status for a user
	  _scope.setUserAsLogged = function(id, logged, original_res, successCallback, errorCallback) {
	    logged = logged || 1;

	    var query = "UPDATE users SET is_logged = ? WHERE id = ?";
	    $cordovaSQLite.execute($rootScope.database, query, [1, id]).then(function(res) {
	      successCallback.call(this, original_res);
	    }, function (err) {
	      errorCallback.call(this, err);
	    });
	  }

	  //Update a loggin status for a user
	  _scope.setAutoSync = function(id, as) {

	    if ( as ) {
	    	as = 1;
	    } else {
	    	as = 0;
	    }

	    // console.log('Up to change status to', as);

	    $rootScope.user.setAutoSync(as);

	    var query = "UPDATE users SET auto_sync = ? WHERE id = ?";
	    return $cordovaSQLite.execute($rootScope.database, query, [as, id]);
	  }


	  _scope.checkLocalUser = function(user, successCallback, errorCallback) {
	      var query = "SELECT * FROM users WHERE email = ?";

	      $cordovaSQLite.execute($rootScope.database, query, [user.email]).then(function(res) {
	        if(res.rows.length > 0) {
	            successCallback.call(this, res.rows.item(0));
	        } else {
	            _scope.createLocalLogin(user, successCallback, errorCallback);
	        }
	      }, function (err) {
	          $rootScope.utils.showAlert("Error", "No se pudo guardar la sesion. - " + err);
	      });
	  }


	  _scope.checkLocalUserLogged = function(successCallback, errorCallback) {
	      var query = "SELECT * FROM users WHERE is_logged = ?";

	      $cordovaSQLite.execute($rootScope.database, query, [1]).then(function(res) {
	        if(res.rows.length > 0) {
	            successCallback.call(this, res.rows.item(0));
	        } else {
	            // _scope.createLocalLogin(user, successCallback, errorCallback);
	            errorCallback.call(this, "No local user", "manual");
	        }
	      }, function (err) {
	          // $rootScope.showAlert("Error", "No se pudo guardar la sesion. - " + err);
	          errorCallback.call(this, err, "sqlite");
	      });
	  }




		_scope.login = function() {
	    $rootScope.utils.loading();

	    if ( !_scope.loginData.email || !_scope.loginData.password ) {
	      $rootScope.utils.showAlert("Notificacion", 'Porfavor ingresa tus credenciales. Asegurate de introducir valores en todos'
	        + ' los campos.');

	      $rootScope.utils.loaded();

	      return false;
	    }

	    if (!$rootScope.utils.checkDBSupport()) {
	      $rootScope.utils.loaded();
	      return false;
	    }


	    if ( !$rootScope.online ) {
	      $rootScope.utils.showAlert('No estas conectado?');

	      var query = "SELECT * FROM users WHERE email = ?";
	      $cordovaSQLite.execute($rootScope.database, query, [ _scope.loginData.email ])
	      .then(function(res) {
	        if ( res.rows.length ) {
	          _scope.loginSuccess({ user: res.rows.item(0) }, function() {

	            if ( $rootScope.utils.back_to.name && $state.current.name != $rootScope.utils.back_to.name ) {
		            $state.go($rootScope.utils.back_to.name, $rootScope.utils.back_to.params);
		          } else {
		          	$state.go("home");
		          }

		          // console.log("now i must loggin..");

	            $rootScope.utils.back_to = { name: "", params: {} };

	          	$timeout(function() {
	          		$rootScope.loginmodal.hide();
	          		$timeout($rootScope.utils.loaded, 100);
	          	}, 800);

	            setTimeout(function() {
	              biu("Te has logueado como usuario en modo offline.", { type: 'success' });
	            }, 3000);

	          });
	        } else {
	         $rootScope.utils.showAlert("Algo salio mal.",
	            'Las credenciales indicadas parecen ser incorrectas. Porfavor, intenta nuevamente.');
	         $rootScope.utils.loaded();
	        }
	      }, function(err) {
	        console.log(err);
	      });

	      return false;
	    }



	    $http.post($rootScope.api.login_url(), "email=" + _scope.loginData.email
	      + "&password=" + _scope.loginData.password,
	      { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'} })
	    	.then(function(response) {

	    		if ( response.data.error ) {
	    			$rootScope.utils.showAlert("Algo salio mal.",
	    				'Las credenciales indicadas parecen ser incorrectas. Porfavor, intenta nuevamente.');
	    		} else {
	    			_scope.loginSuccess(response.data, function() {


	    				if ( $rootScope.utils.back_to.name && $state.current.name != $rootScope.utils.back_to.name ) {
		            $state.go($rootScope.utils.back_to.name, $rootScope.utils.back_to.params);
		          } else {
		          	$state.go("home");
		          }

		          // console.log("now i must loggin..");

	            $rootScope.utils.back_to = { name: "", params: {} };

	          	$timeout(function() {
	          		$rootScope.loginmodal.hide();
	          		$timeout($rootScope.utils.loaded, 100);
	          	}, 800);

	          	biu("Has iniciado sesion correctamente.", { type: 'success' });

	    			});
	    		}

	    		$rootScope.utils.loaded();

	    	}, function(err) {
	    		$rootScope.utils.loaded();

	        if ( err.status < 0 ) {
	          $rootScope.online = false;

	          _scope.login();
	        } else {
	          $rootScope.utils.showAlert("Algo salio mal.", 'El servidor no responde, porfavor intenta mas tarde.');
	        }
	    	});


	  }

	  _scope.loginSuccess = function(response, callback) {
	  	var _user = response.user;

	    _scope.checkLocalUser(_user, function(res) {

	      // console.log("checked local user", res);

	      _scope.setUserAsLogged.call(this, res.id, 1, res, function(res) {

	        // console.log(res, "set looged in sql");

	        $rootScope.user.setLoggedAs(res);

	        callback.apply(this, null);
	      }, function(err) {
	        // console.log("Ocurrio error", err, res);
	      });
	    });

	  }


	  _scope.checkIfWasAuth = function() {

	  	$rootScope.utils.loading();

	    if (!$rootScope.utils.checkDBSupport()) {
	      $rootScope.utils.loaded();
	      return false;
	    }

	    // $cordovaSQLite.execute($rootScope.database, "DROP TABLE users");

	    $cordovaSQLite.execute($rootScope.database,
	      "CREATE TABLE IF NOT EXISTS users (id integer primary key, email text, name text, password text, is_logged integer, "
	      + "auto_sync integer)").then(function() {

	      	//Because sqlite.queries are async, wait for it to be done
	      	_scope.checkLocalUserLogged(function(res) {
			      _scope.setUserAsLogged.call(this, res.id, 1, res,
			        function(res) {
			          $rootScope.user.setLoggedAs(res);

			          $rootScope.utils.checkedAuth = true;

			          if ( $rootScope.utils.back_to.name && $state.current.name != $rootScope.utils.back_to.name ) {
			            $state.go($rootScope.utils.back_to.name, $rootScope.utils.back_to.params);
			          } else {
			          	$state.go("home");
			          }

			          // console.log("now i must loggin..");

		            $rootScope.utils.back_to = { name: "", params: {} };

		          	$timeout(function() {
		          		$rootScope.loginmodal.hide();
		          		$timeout($rootScope.utils.loaded, 100);
		          	}, 800);


			        },
			        function(err) {
			          // console.log(err);
			        });

			    }, function( err, generator ) {
			      //No session exists
			      // console.log(err, generator);
			      $rootScope.utils.loaded();
			    });


	      });

	  }


	}


	return loginManager;


});
