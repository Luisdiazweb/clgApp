// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('clg', [
    'ionic', 
    'ngCordova', 
    'clg.config',
    'clg.factories', 
    'clg.controllers'
  ])

.run(function($ionicPlatform, $cordovaSQLite, $rootScope, $window) {
  $ionicPlatform.ready(function() {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    if (window.cordova) {
      $rootScope.database = $cordovaSQLite.openDB("clg.db");
    }else{
      if (  window.openDatabase != undefined ) {
        $rootScope.database = window.openDatabase("clg.db", '1', 'my', 1024 * 1024 * 100); // browser
      } else {
        $rootScope.database = 'NOT_SUPPORTED';
      }
    }


    $rootScope.online = navigator.onLine;

    $rootScope.deviceReady = true;

    var $jqwindow = angular.element($window); // Name the variable whatever makes sense

    $jqwindow.on("offline", function() {
      $rootScope.$apply(function() {
        $rootScope.online = false;
      });
    });

    $jqwindow.on("online", function() {
      $rootScope.$apply(function() {
        $rootScope.online = true;
      });
    });
    

  });
});



angular.module('clg.config', []);
angular.module('clg.factories', []);
angular.module('clg.controllers', []);