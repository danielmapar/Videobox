app.config(['$locationProvider','$stateProvider', '$urlRouterProvider', 'noCAPTCHAProvider',
 function($locationProvider, $stateProvider, $urlRouterProvider, noCaptchaProvider) {

 	noCaptchaProvider.setSiteKey('6LeVNwsTAAAAAEzMj08RHMf5dhEbQciDNPN9h9t9');
    noCaptchaProvider.setTheme('light');

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: '/home.html',
			controller: 'MainCtrl'
		})
		.state('resetPassword', {
			url: '/resetPassword/:username/:token',
			templateUrl: '/home.html',
			controller: 'MainCtrl'
		})
		.state('validateAccount', {
			url: '/validateAccount/:username/:token',
			templateUrl: '/home.html',
			controller: 'MainCtrl'
		});

	$urlRouterProvider.otherwise('/');
	$locationProvider.html5Mode(true);
}]);