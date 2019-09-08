angular.module('pluang', [
	'ngCookies',
	'ngMaterial',
	"ui.router",
	"angular-loading-bar",
	"pluangServices",
	"pluangConsants",
	"pluangControllers"])
.config(config)
.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.on('change', onChangeHandler);
      element.on('$destroy', function() {
        element.off();
      });

    }
  };
});


config.$inject = ['$httpProvider', '$compileProvider' , '$stateProvider', '$urlRouterProvider'];


function config($httpProvider, $compileProvider ,$stateProvider, $urlRouterProvider) {


$stateProvider
.state('home', {
	templateUrl: 'views/home.html',
	abstract: true,
	controller: 'mainController',
})
.state('home.upoad',{
	url : '/upoad',
	templateUrl: 'views/upoad.html',
	controller: 'homeController',
})

$urlRouterProvider.otherwise('/upoad');


}
