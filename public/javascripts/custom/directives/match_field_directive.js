angular.module('videoBox')
    .directive('matchField', function () {
    'use strict';
      return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
          var value, changed;
          function validateEqual(myValue, otherValue) {
            ctrl.$setValidity('match', myValue === otherValue);
          }
          scope.$watch(attrs.matchField, function (otherModelValue) {
            // Set value to otherModelVale once it's passed in.
            if (!value && otherModelValue) {
              value = otherModelValue;
            }
            // If the original is changed, then set a flag an validate.
            if (otherModelValue !== value) {
              changed = true;
              validateEqual(ctrl.$viewValue, otherModelValue);
            }
          });
          ctrl.$parsers.unshift(function (viewValue) {
            if (changed) {
              validateEqual(viewValue, scope.$eval(attrs.matchField));
              return viewValue;
            }
          });
        }
      };
});