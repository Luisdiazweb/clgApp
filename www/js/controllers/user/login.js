
angular.module('clg.controllers')
.controller('LoginController', function($scope, $rootScope, $state, $stateParams, $ionicSideMenuDelegate, $http, $cordovaSQLite) {


  //Manage the login data model
	$scope.loginData = {
		email: "",
		password: ""
	};


  /*
  * Create a user in the local Database if not exists to save sessions
  *
  * @param user {object} is the user object containg user information
  */
  $scope.createLocalLogin = function(user, successCallback, errorCallback) {
    var query = "INSERT INTO users (email, name, password, is_logged) VALUES (?,?,?,?)";
        $cordovaSQLite.execute($rootScope.database, query, [user.email, user.name, user.password, 0]).then(function(res) {
          successCallback.call(this, res.insertId);
    }, function (err) {
        $rootScope.utils.showAlert("Error", "No se pudo guardar la sesion. - " + err);
    });
  }

  //Update a loggin status for a user
  $scope.setUserAsLogged = function(id, logged, original_res, successCallback, errorCallback) {
    logged = logged || 1;

    var query = "UPDATE users SET is_logged = ? WHERE id = ?";
    $cordovaSQLite.execute($rootScope.database, query, [logged, id]).then(function(res) {
      successCallback.call(this, original_res);
    }, function (err) {
      errorCallback.call(this, err);
    });
  }


  $scope.checkLocalUser = function(user, successCallback, errorCallback) {
      var query = "SELECT * FROM users WHERE email = ?";

      $cordovaSQLite.execute($rootScope.database, query, [user.email]).then(function(res) {
        if(res.rows.length > 0) {
            successCallback.call(this, res.rows.item(0));
        } else {
            $scope.createLocalLogin(user, successCallback, errorCallback);
        }
      }, function (err) {
          $rootScope.utils.showAlert("Error", "No se pudo guardar la sesion. - " + err);
      });
  }


  $scope.checkLocalUserLogged = function(successCallback, errorCallback) {
      var query = "SELECT * FROM users WHERE is_logged = ?";

      $cordovaSQLite.execute($rootScope.database, query, [1]).then(function(res) {
        if(res.rows.length > 0) {
            successCallback.call(this, res.rows.item(0));
        } else {
            // $scope.createLocalLogin(user, successCallback, errorCallback);
            errorCallback.call(this, "No local user", "manual");
        }
      }, function (err) {
          // $rootScope.showAlert("Error", "No se pudo guardar la sesion. - " + err);
          errorCallback.call(this, err, "sqlite");
      });
  }



	
	$scope.login = function() {
    $rootScope.utils.loading();

    $http.post($rootScope.api.login_url(), "email=" + $scope.loginData.email 
      + "&password=" + $scope.loginData.password, 
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'} })
    	.then(function(response) {

    		if ( response.data.error ) {
    			$rootScope.utils.showAlert("Algo salio mal.", 
    				'Las credenciales indicadas parecen ser incorrectas. Porfavor, intenta nuevamente.');
    		} else {
    			$scope.loginSuccess(response.data, function() {
    				$state.go('home');
    			});
    		}

    		$rootScope.utils.loaded();

    	}, function() {
    		$rootScope.utils.loaded();
    		$rootScope.utils.showAlert("Algo salio mal.", 'El servidor no responde, porfavor intenta mas tarde.');
    	});


  }

  $scope.loginSuccess = function(response, callback) {
  	var _user = response.user;

    $scope.checkLocalUser(_user, function(res) {
      
      console.log("checked local user", res);

      $scope.setUserAsLogged.call(this, res.id, 1, res, function(res) {
        
        console.log(res, "set looged in sql");

        $rootScope.user.setLoggedAs(res);

        callback.apply(this, null);
      }, function(err) {
        console.log("Ocurrio error", err, res);
      });
    });

  }


  $rootScope.utils.loading();

  $scope.checkIfWasAuth = function() {

    $cordovaSQLite.execute($rootScope.database, 
      "CREATE TABLE IF NOT EXISTS users (id integer primary key, email text, name text, password text, is_logged integer)");

    $scope.checkLocalUserLogged(function(res) {
      $scope.setUserAsLogged.call(this, res.id, 1, res, 
        function(res) {
          $rootScope.user.setLoggedAs(res);

          $state.go("home");
          $rootScope.utils.checkedAuth = true;
          $rootScope.utils.loaded();

          if ( $rootScope.utils.back_to.name ) {
            $state.go($rootScope.utils.back_to.name, $rootScope.utils.back_to.params);
            $rootScope.utils.back_to = { name: "", params: {} };
          }
        }, 
        function(err) {
          console.log(err);
        });
      
    }, function( err, generator ) {
      //No session exists
      $rootScope.utils.loaded();
    });
  }



  $rootScope.$watch('deviceReady', function(isReady) {
    if ( isReady ) {
      if ( !$rootScope.utils.checkedAuth ) {
        $scope.checkIfWasAuth();
      }
    }
  });


});