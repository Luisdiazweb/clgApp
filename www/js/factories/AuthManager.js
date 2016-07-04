
angular.module('clg.factories')
.factory('AuthManager', function($rootScope, $state) {

	function auth() {
		var auth = false;
		var _self = this;


		this.name = "";
		this.email = "";
		this.password = "";
		this.user_id = "";

		this.isLogged = function() {
			return auth;
		}

		this.setLoggedAs = function(user) {
			_self.name = user.name;
			_self.email = user.email;
			_self.password = user.password;
			_self.user_id = user.id;

			auth = true;
		}

	this.logoutUser = function() {
			_self.name = "";
			_self.email = "";
			_self.password = "";
			_self.user_id = "";

			auth = false;
		}
	}

	return new auth();
	

});