app.controller("MainCtrl", [ '$scope', '$state', '$stateParams', '$q', '$modal', 'auth', 'Screens', 'LeftMenu', 'Container', 'Box', 'Video',
function($scope, $state, $stateParams, $q, $modal, auth, Screens, LeftMenu, Container, Box, Video){

	$scope.screens 	 = new Screens();
	$scope.leftMenu  = new LeftMenu();
	$scope.box       = new Box();
	$scope.container = new Container();

	$scope.videoBeingDragged = null;

	$scope.isLoggedIn   = auth.isLoggedIn;
	$scope.isUserLocked = auth.isUserLocked;
	$scope.currentUser  = auth.currentUser;
	$scope.logOut       = auth.logOut;

	var VIDEO_SOURCE = {
							container: 'container',
						 	box: 'box'
						};

	$scope.$on('$viewContentLoaded', function(){
		// Open reset password modal
		if ($state.href($state.current.name).indexOf("resetPassword") !== -1 && 
			$stateParams.username && $stateParams.token) {
			$scope.setNewPasswordModal($stateParams.username, $stateParams.token);
		}
		// Validate User Account
		else if ($state.href($state.current.name).indexOf("validateAccount") !== -1 && 
			$stateParams.username && $stateParams.token) {

			auth.validateAccount($stateParams.username, $stateParams.token).success(function(data) {
				auth.saveToken(data.token);
				$state.go('home');
			}).error(function(response) {
				var modalScope = $scope.$new(true);
				modalScope.error = response;

				var modalInstance = $modal.open({
					scope: modalScope,
					animation: true,
					templateUrl: 'invalidToken.html',
					controller: 'AuthCtrl'
				});
				/* Go back to home state */
				modalInstance.result.then(null, function () {
					$state.go('home');
				});
			});
		}
	});

	$scope.container.getTopDailyVideos();

	$scope.newBox = function() {
		$scope.box = new Box();
	};

	$scope.changeContainerScreens = function(option) {
		$scope.screens.setSelectedOption(option);
		$scope.container.setVideos([]);

		switch(option) {
			case 1:
				// pushVideo
				break;
			case 2:
				break;
			case 4:
				break;
			case 6:
				break;
			case 9:
				break;
			case 15:
				break;
			default:
				break;
		}
				
	}
	
	/*********** Container Drag and Drop ***********/

	$scope.startDraggingVideoFromContainer = function(event, ui, video) {
		video.setBeingDragged(true);
		$scope.videoBeingDragged = video;
	};

	$scope.stopDraggingVideoFromContainer = function(event, ui) {
		console.log("stopDraggingVideoFromContainer");
		if ($scope.videoBeingDragged.from === VIDEO_SOURCE.container) {
			$scope.$apply(function() {
				$scope.container.clearMouseOver();
				$scope.container.clearBeingDragged();

				// Refresh box events if not creating it for the first time
				if (!$scope.box.creating) {
					$scope.box.scrollToTheRight();
					$scope.box.setVideoOver(false);
					$scope.box.setVideoOverGap(false, null);
					$scope.videoBeingDragged = null;
				}
				$scope.box.creating = null;
			});
		}
	};

	$scope.draggingVideoOverVideoInsideContainer = function(event, ui, video) {
		if ($scope.videoBeingDragged.from === VIDEO_SOURCE.container) {
			$scope.$apply(function() {
				$scope.box.setVideoOver(false);

				if ($scope.videoBeingDragged !== video) {
					$scope.container.setMouseOver(video);
				} else {
					$scope.container.clearMouseOver();
				}
			});
		}
	};

	$scope.dropVideoInsideContainer = function(event, ui, video) {
		if ($scope.videoBeingDragged.from === VIDEO_SOURCE.box) {
			return rejectPromise();
		} else if ($scope.videoBeingDragged.from === VIDEO_SOURCE.container) {
			return resolvePromise();
		}
	};

	/*********** Box Drag and Drop ***********/
	
	$scope.draggingVideoOverBox = function(event, ui) {
		console.log('draggingVideoOverBox');
		if ($scope.videoBeingDragged.from === VIDEO_SOURCE.container) {
			$scope.$apply(function() {
				$scope.container.clearMouseOver();
				$scope.box.setVideoOver(true);
				$scope.box.setVideoOverGap(false, null);
			});
		}
	};

	$scope.draggingVideoOutOfBox = function(event, ui) {
		console.log('draggingVideoOutOfBox');
		if ($scope.videoBeingDragged.from === VIDEO_SOURCE.container) {
			$scope.$apply(function() {
				$scope.box.setVideoOver(false);
				$scope.box.setVideoOverGap(false, null);
			});
		}
	};
	
	$scope.dropVideoInsideBox = function(event, ui) {
		console.log('dropVideoInsideBox');

		if ($scope.videoBeingDragged.from === VIDEO_SOURCE.container) {
			// Create box 
			if ($scope.box.size() === 0) {
				$scope.box.creating = true;

				$scope.createBoxModal().result.then(function () {
					addVideoInsideBox();
					clearBoxEvents();
				}, function () {
					clearBoxEvents();
				});
			// Add to existing box 
			} else {
				$scope.box.creating = false;
				addVideoInsideBox();
			}
			
		} else if ($scope.videoBeingDragged.from === VIDEO_SOURCE.box) {
			
			addVideoInsideBox();
			$scope.box.removeVideoBeingDragged();
		}

		return rejectPromise();
	};

	function addVideoInsideBox() {
		// Gap drop
		var videoDroppedOverGap = $scope.box.pushVideoToGap($scope.videoBeingDragged);

		// New drop
		if (!videoDroppedOverGap) {
			$scope.box.pushVideo($scope.videoBeingDragged);
		}
	}

	function clearBoxEvents() {
		$scope.box.scrollToTheRight();
		$scope.box.setVideoOver(false);
		$scope.box.setVideoOverGap(false, null);
		$scope.videoBeingDragged = null;
	}
	
	$scope.draggingVideoOverGapInsideBox = function(event, ui, video) {
		console.log('draggingVideoOverGapInsideBox');

		if ($scope.videoBeingDragged.from === VIDEO_SOURCE.container) {
			$scope.$apply(function() {
				$scope.box.setVideoOver(true);
				$scope.box.setVideoOverGap(true, video);
			});
		} else if ($scope.videoBeingDragged.from === VIDEO_SOURCE.box &&
					!video.beingDragged) {
			$scope.$apply(function() {
				$scope.box.setVideoOverGap(false, null);
				$scope.box.setVideoOver(true);
				$scope.box.setVideoOverGap(true, video);
			});
		}
	};

	$scope.draggingVideoOverBoxVideo = function(event, ui) {
		console.log('draggingVideoOverBoxVideo');
		
		if ($scope.videoBeingDragged.from === VIDEO_SOURCE.container) {
			$scope.$apply(function() {
				$scope.box.setVideoOver(true);
				$scope.box.setVideoOverGap(false, null);
			});
		} else if ($scope.videoBeingDragged.from === VIDEO_SOURCE.box) {
			$scope.$apply(function() {
				$scope.box.setVideoOverGap(false, null);
				$scope.box.setVideoOver(false);
				if (!$scope.box.isVideoBeingDraggedLastOne()) {
					$scope.box.setVideoOver(true);
				}
			});
		}
	};
	
	$scope.startDraggingVideoFromBox = function(event, ui, video) {
		console.log('startDraggingVideoFromBox');
		$scope.$apply(function() {
			video.setBeingDragged(true);
			$scope.videoBeingDragged = video;
		});
	};


	$scope.stoppedDraggingVideoFromBox = function(event, ui) {
		console.log('stoppedDraggingVideoFromBox');
		if ($scope.videoBeingDragged.from === VIDEO_SOURCE.box) {
			$scope.$apply(function() {
				$scope.container.clearMouseOver();
				$scope.box.clearBeingDragged();
				$scope.box.setVideoOver(false);
				$scope.box.setVideoOverGap(false, null);
				$scope.videoBeingDragged = null;
			});
		}
	};

	/*********** Modals ***********/

	$scope.loginModal = function() {

		$modal.open({
			animation: true,
			templateUrl: 'login.html',
			controller: 'AuthCtrl',
			size: 'sm'
		});
	};

	$scope.registerModal = function() {

		$modal.open({
			animation: true,
			templateUrl: 'register.html',
			controller: 'AuthCtrl',
			windowClass: 'sign-up-modal'
		});
	};

	$scope.unlockUserModal = function() {

		$modal.open({
			animation: true,
			templateUrl: 'unlockUser.html',
			controller: 'AuthCtrl'
		});
	};

	$scope.resetPasswordModal = function() {

		$modal.open({
			animation: true,
			templateUrl: 'requestPasswordReset.html',
			controller: 'AuthCtrl'
		});
	};

	$scope.forgotPasswordModal = function() {

		$modal.open({
			animation: true,
			templateUrl: 'forgotPassword.html',
			controller: 'AuthCtrl'
		});
	};

	$scope.setNewPasswordModal = function(username, token) {

		if (username && token) {
			var modalScope = $scope.$new(true);

			auth.checkResetPasswordToken(username, token).then(function() {

				modalScope.user = {username: username, token: token};

				var modalInstance = $modal.open({
					scope: modalScope,
					animation: true,
					templateUrl: 'setNewPassword.html',
					controller: 'AuthCtrl',
				});
				/* Go back to home state */
				modalInstance.result.then(null, function () {
					$state.go('home');
				});

			}).catch(function(response) {
				modalScope.error = response.data;

				var modalInstance = $modal.open({
					scope: modalScope,
					animation: true,
					templateUrl: 'invalidToken.html',
					controller: 'AuthCtrl'
				});
				/* Go back to home state */
				modalInstance.result.then(null, function () {
					$state.go('home');
				});
			});

			
		}
	};

	$scope.createBoxModal = function() {

		var modalScope = $scope.$new(true);

		var modalInstance = $modal.open({
			scope: modalScope,
			animation: true,
			templateUrl: 'createBox.html',
			controller: 'MainCtrl'
			//size: 'sm'
		});

		modalScope.cancel = function () {
			modalInstance.dismiss('cancel');
		};

		modalScope.create = function (name, tags) {
			
			var tagsText = [];
			// Extract tags from model
			for(var i = 0; i < tags.length; i++) {
				tagsText.push(tags[i].text);
			}
			
			var box = {
						name: name,
						tags: tagsText
					  };

			modalScope.waitingCreateBoxRequest = true;

			if (auth.isLoggedIn()) {
				$scope.box.create(box).error(function(error){
					modalScope.error = error;
					modalScope.waitingCreateBoxRequest = false;
				}).then(function(){
					modalScope.waitingCreateBoxRequest = false;
					modalInstance.close();
				});
			} else {
				$scope.box.create(box);
				modalScope.waitingCreateBoxRequest = false;
				modalInstance.close();
			}
			
		};

		return modalInstance;
	};

	$scope.deleteBoxVideoModal = function(video, videoIndex) {

		var modalScope = $scope.$new(true);

		modalScope.video = video;

		var modalInstance = $modal.open({
			scope: modalScope,
			animation: true,
			templateUrl: 'deleteBoxVideo.html',
			controller: 'MainCtrl',
			size: 'lg'
		});

		modalScope.cancel = function () {
			modalInstance.dismiss('cancel');
		};

		modalScope.delete = function () {
			$scope.box.removeVideo(videoIndex);
			modalInstance.close();
		};
	};

	$scope.playVideoFromBoxModal = function(video) {

		var modalScope = $scope.$new(true);

		modalScope.video = video;

		var modalInstance = $modal.open({
			scope: modalScope,
			animation: true,
			templateUrl: 'playVideoFromBox.html',
			controller: 'MainCtrl',
			size: 'lg'
		});

		modalScope.close = function () {
			modalInstance.dismiss('cancel');
		};
	};

	/*********** Supporting functions ***********/

	function rejectPromise() {
		var deferred = $q.defer();
		deferred.reject();
		return deferred.promise;
	}

	function resolvePromise() {
		var deferred = $q.defer();
		deferred.resolve();
		return deferred.promise;
	}

}]);