
angular.module('clg.controllers')
.controller('LogoutController', function($scope, $rootScope, $state, $stateParams, $ionicSideMenuDelegate, $http, $cordovaSQLite) {


  /*
  * Update session status in local Database
  *
  * @param id {integer} is the user->id to modify
  * @param successCallback {function} is the asyn callback to perform when the status is changed
  * @param errorCallback {function} is the async callback to perform when an error ocurred
  *
  * @return
  */
  $scope.setUserAsLoggedOut = function(id, successCallback, errorCallback) {

    var query = "UPDATE users SET is_logged=? WHERE id=?";
    $cordovaSQLite.execute($rootScope.database, query, [0, id]).then(function(res) {
      successCallback.call(this);
    }, function (err) {
      errorCallback.call(this, err);
    });
  }


	/*
  * Logic to perform a logout
  * 
  * @return
  */
	$scope.logout = function() {

    //Set the {App} status to loading
    $rootScope.loading();

    //Call the logout status changer in the database
    $scope.setUserAsLoggedOut($rootScope.user.user_id, function() {

      //Set global user model as logged-out
      $rootScope.user.logoutUser();

      //redir to login screen when is logged-out
      $state.go("index");
    }, function(err) {

      //Set global user model as logged-out
      $rootScope.user.logoutUser();

      //redir to login screen when is logged-out
      $state.go("index");
    });

  }


  $scope.logout();


});