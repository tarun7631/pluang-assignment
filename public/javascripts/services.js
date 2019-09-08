angular.module('pluangServices', [])

.factory('QueryService', [ 
	'$http', 
	'$q', 
	'$rootScope', 
	'CONSTANTS', function QueryService(
		$http, 
		$q, 
		$rootScope , 
		CONSTANTS) {

		var service = {
			query: query
		};

		return service;


		function query(method,headers, url, params, data) {

			var deferred = $q.defer();
			$http({
				method: method,
				url: CONSTANTS.API + url,
				headers : headers,
				params: params,
				data: data
			}).then(function(data) {
				if (!data.config) {
					console.log('Server error occured.');
				}
				deferred.resolve(data);
			}, function(error) {
				deferred.reject(error);
			});

			return deferred.promise;
		}

	}
	]);