app.factory('auth', ['$http', '$window', function($http, $window) {
	var auth = {};

	auth.saveToken = function (token){
		$window.localStorage['videobox-token'] = token;
	};

	auth.getToken = function (){
		return $window.localStorage['videobox-token'];
	};

	auth.getAuthorizationHeader = function() {
		return {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		};
	};

	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.isUserLocked = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var user = JSON.parse($window.atob(token.split('.')[1]));

			return user.email ? false : true;
		} else {
			return false;
		}
	};

	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var user = JSON.parse($window.atob(token.split('.')[1]));

			return user.username;
		}
	};

	auth.register = function(user){
		return $http.post('/register', user).success(function(data){
			// Only login anonymous users
			if (!user.email) {
				auth.saveToken(data.token);
			}
		});
	};

	auth.sendResetPasswordToken = function(){
		return $http.post('/user/resetPassword', null, auth.getAuthorizationHeader());
	};

	auth.sendForgotPasswordToken = function(usernameOrEmail){
		return $http.post('/user/forgotPassword', {usernameOrEmail: usernameOrEmail});
	};

	auth.checkResetPasswordToken = function(username, token) {
		return $http.post('/user/checkResetPasswordToken', 
			{username: username, token: token});
	};

	auth.setNewPassword = function(user){
		return $http.post('/user/setNewPassword', user).success(function(data){
			auth.saveToken(data.token);	
		});
	};

	auth.activateAnonymousUser = function(user){
		return $http.post('/user/reactivate', user).success(function(data){
			auth.saveToken(data.token);	
		});
	};

	auth.resendEmailValidationToken = function(email){
		return $http.post('/user/resendEmailValidationToken', {email: email});
	};

	auth.validateAccount = function(username, token) {
		return $http.post('/user/validateAccount', 
			{username: username, token: token});
	};

	auth.unlockUser = function(email){
		return $http.post('/user/unlock', {email: email}, auth.getAuthorizationHeader())
					.success(function(data){
						auth.saveToken(data.token);	
					});
	};

	auth.logIn = function(user){
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logOut = function(){
		$window.localStorage.removeItem('videobox-token');
	};

	return auth;
}]);