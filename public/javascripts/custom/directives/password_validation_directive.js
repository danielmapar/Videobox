angular.module('videoBox')
	.directive('passwordValidation', function () {
		'use strict';

		return {
			require: 'ngModel',
			link: function(scope, elm, attrs, ctrl) {

				ctrl.$parsers.unshift(function(viewValue) {
					var passwordLength = false,
						passwordAlphaNumeric = false,
						alphaNumRegex = new RegExp('[0-9]+.*[a-zA-Z]+|[a-zA-Z]+.*[0-9]+');

					// Validate password length
					if (viewValue.length < 8 || viewValue.length > 30) {
						passwordLength = true;
					}

					// Validate if password is alpha numeric
					if (!alphaNumRegex.test(viewValue)) {
						passwordAlphaNumeric = true;
					}

					ctrl.$setValidity('passwordLength', !passwordLength);
					ctrl.$setValidity('passwordAlphaNumeric', !passwordAlphaNumeric);

					return viewValue;
				});

			}
		};
	});