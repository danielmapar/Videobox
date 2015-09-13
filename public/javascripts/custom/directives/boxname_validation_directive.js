angular.module('videoBox')
	.directive('boxnameValidation', function () {
		'use strict';

		return {
			require: 'ngModel',
			link: function(scope, elm, attrs, ctrl) {

				ctrl.$parsers.unshift(function(viewValue) {
					var boxnameLength = false;

					// Validate box name length
					if (viewValue.length < 5 || viewValue.length > 140) {
						boxnameLength = true;
					}

					ctrl.$setValidity('boxnameLength', !boxnameLength);

					return viewValue;
				});

			}
		};
	});