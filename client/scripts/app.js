'use strict';

angular
    .module('eventsApp', [
        'ngRoute',
        //'ngSanitize',
        //'ngTouch'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/location/:location', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/location/M-Eola'
            });
    });
