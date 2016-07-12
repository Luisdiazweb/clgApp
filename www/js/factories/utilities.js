
angular.module('clg.factories')
.factory('Utilities', function($ionicPopup, $ionicLoading, $rootScope) {

	function Utilities() {
		var _scope = this;

		this.checkedAuth = false;
	  this.checkedModuleTables = false;
	  this.checkedSyncing = false;
	  this.sync_index = 0;
	  this.back_to = { name: "", params: {} };
	  this.backgroundLoading = false;
	  this.isLoading = false;

	  this.navBarClass = 'bar-light';

	  this.checkDBSupport = function() {
	  	if ( $rootScope.database == "NOT_SUPPORTED" ) {
	      _scope.showAlert("Notificacion de la aplicacion", 'Esta simulacion no funcionara debido a que el navegador '
	          + 'no soporta las tecnologias necesaria.');

	      _scope.loaded();

	      return false;
	    }

	    return true;
	  }

	  //define a server error when endpoints fails
	  this.showAlert = function(title, message) {

	    var alert_defaults = {
	      title: 'Algo esta mal.',
	      message: 'Porfavor intenta mas tarde.'
	    };

	    var serverErrorPop = $ionicPopup.alert({
	     title: _scope.get_variable(title, alert_defaults.title),
	     template: _scope.get_variable(message, alert_defaults.message)
	    });

	  }

	  //default value
	  this.get_variable = function(variable, default_value) {
	    if ( variable ) {
	      return variable;
	    }

	    return default_value;
	  }


	  //Show a Loading Message when ajax is performing
	  this.loading = function() {
	  	_scope.isLoading = true;
	    $ionicLoading.show({
	      template: '<ion-spinner></ion-spinner>'
	    });
	  };


	  //hide Loading Message after ajax is performed
	  this.loaded = function(){
	  	_scope.isLoading = false;

	    $ionicLoading.hide();
	  };
	}

	return new Utilities();
	

});