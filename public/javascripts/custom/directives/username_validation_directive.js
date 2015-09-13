angular.module('videoBox')
	.directive('usernameValidation', function () {
		'use strict';

		function validateEmail(email) {
			var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
			return re.test(email);
		}

		return {
			require: 'ngModel',
			link: function(scope, elm, attrs, ctrl) {

				ctrl.$parsers.unshift(function(viewValue) {
					var usernameLength  = false,
						usernameIsEmail = false;

					// Validate username length
					if (viewValue.length < 5 || viewValue.length > 17) {
						usernameLength = true;
					}

					if (validateEmail(viewValue)) {
						usernameIsEmail = true;
					}

					ctrl.$setValidity('usernameLength', !usernameLength);
					ctrl.$setValidity('usernameIsEmail', !usernameIsEmail);

					return viewValue;
				});

			}
		};
	});