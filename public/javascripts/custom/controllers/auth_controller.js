app.controller('AuthCtrl', ['$scope', '$state', '$stateParams', '$modal', '$modalInstance', '$state', 'auth', 'noCAPTCHA',
	function($scope, $state, $stateParams, $modal, $modalInstance, $state, auth, noCAPTCHA) {
	$scope.user = {};
	$scope.waitingRegisterRequest              = false;
	$scope.waitingLoginRequest                 = false;
	$scope.waitingUnlockUserRequest            = false;
	$scope.waitingActivateAnonymousUserRequest = false;
	$scope.waitingSendResetPasswordRequest     = false;
	$scope.waitingSendForgotPasswordRequest    = false;
	$scope.waitingSetNewPasswordRequest        = false;

	$scope.register = function(){
		$scope.waitingRegisterRequest = true;
		auth.register($scope.user).error(function(error){
			$scope.error = error;
			$scope.captchaControl.reset();
			$scope.waitingRegisterRequest = false;
		}).then(function(){
			$scope.waitingRegisterRequest = false;
			$modalInstance.close();
			if($scope.user && $scope.user.email) {

				var modalScope = $scope.$new(true);

				var modalInstance = $modal.open({
					scope: modalScope,
					animation: true,
					templateUrl: 'emailValidationSent.html',
					controller: 'AuthCtrl'
				});

				modalScope.cancel = function () {
					modalInstance.dismiss('cancel');
				};

				modalScope.sendEmailAgain = function () {
					auth.resendEmailValidationToken($scope.user.email);
				};
			}
		});
	};

	$scope.sendResetPasswordRequest = function() {
		$scope.waitingSendResetPasswordRequest = true;
		auth.sendResetPasswordToken().error(function(error){
			$scope.error = error;
			$scope.waitingSendResetPasswordRequest = false;
		}).then(function(){
			$scope.waitingSendResetPasswordRequest = false;
			$modalInstance.close();
		});
	};

	$scope.sendForgotPasswordRequest = function() {
		$scope.waitingSendForgotPasswordRequest = true;
		auth.sendForgotPasswordToken($scope.user.usernameOrEmail).error(function(error){
			$scope.error = error;
			$scope.waitingSendForgotPasswordRequest = false;
		}).then(function(){
			$scope.waitingSendForgotPasswordRequest = false;
			$modalInstance.close();
		});
	};

	$scope.setNewPassword = function() {
		$scope.waitingSetNewPasswordRequest = true;
		
		angular.extend($scope.user, $scope.$parent.user);
		
		auth.setNewPassword($scope.user).error(function(error){
			$scope.error = error;
			$scope.waitingSetNewPasswordRequest = false;
		}).then(function(){
			$state.go('home');
			$scope.waitingSetNewPasswordRequest = false;
			$modalInstance.close();
		});
	};

	$scope.unlockUser = function () {
		$scope.waitingUnlockUserRequest = true;

		auth.unlockUser($scope.user.email).error(function(error){
			$scope.error = error;
			$scope.waitingUnlockUserRequest = false;
		}).then(function(){
			$scope.waitingUnlockUserRequest = false;
			$modalInstance.close();
		});
	};

	$scope.logIn = function() {
		$scope.waitingLoginRequest = true;

		auth.logIn($scope.user).error(function(error){
			$scope.error = error;
			$scope.waitingLoginRequest = false;

			// Request user to provide email address
			if (error.locked) {

				var modalScope = $scope.$new(true);

				var modalInstance = $modal.open({
					scope: modalScope,
					animation: true,
					templateUrl: 'activateAnonymousUser.html',
					controller: 'AuthCtrl'
				});

				modalScope.cancel = function () {
					modalInstance.dismiss('cancel');
				};

				modalScope.save = function () {
					modalScope.waitingActivateAnonymousUserRequest = true;
					$scope.user.email = modalScope.email;

					auth.activateAnonymousUser($scope.user).error(function(error){
						modalScope.error = error;
						modalScope.waitingActivateAnonymousUserRequest = false;
					}).then(function(){
						modalScope.waitingActivateAnonymousUserRequest = false;
						modalInstance.close();
						$modalInstance.close();
					});
				};
			}

		}).then(function(){
			$scope.waitingLoginRequest = false;
			$modalInstance.close();
		});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.forgotPasswordModal = function() {

		$modal.open({
			animation: true,
			templateUrl: 'forgotPassword.html',
			controller: 'AuthCtrl'
		});
	};
}]);