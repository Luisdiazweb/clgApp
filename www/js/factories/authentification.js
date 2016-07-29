
angular.module('clg.factories')
.factory('AuthManager', function($rootScope, $state) {

	function auth() {
		var auth = false;
		var _self = this;


		function parseBoolean(number) {
			if ( number ) {
				return true;
			}

			return false;
		}


		this.name = "";
		this.email = "";
		this.password = "";
		this.user_id = "";
		this.auto_sync = true;

		this.isLogged = function() {
			return auth;
		}

		this.setLoggedAs = function(user) {

			console.log(user, typeof user);

			if ( typeof user === "object" ) {
				_self.name = user.name;
				_self.email = user.email;
				_self.password = user.password;
				_self.user_id = user.id;
				_self.auto_sync = parseBoolean(user.auto_sync);
			}else {
				_self.user_id = user;
			}

			auth = true;


			// $rootScope.syncManager.tasks.fetchAll($rootScope.syncManager.startBackgroundSyncing);
			$rootScope.syncManager.tasks.fetchAll();
		}

		this.setAutoSync = function(as) {
			_self.auto_sync = parseBoolean(as);

			return _self.auto_sync;
		}

		this.syncStatusChange = function(newStatus) {

			if ( !$rootScope.deviceReady ){
				return false;
			}

			$rootScope.loginmanager.setAutoSync(_self.user_id, newStatus).then(function(res) {
				// console.log('cambiado', res);

			// $rootScope.syncManager.startBackgroundSyncing();

			}, function(err) {
				console.log('error', err);
			});
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