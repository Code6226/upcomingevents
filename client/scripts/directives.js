'use strict';

angular.module('eventsApp').directive('foobar', function() {
    return {
        template: '{{bar}}'
    };
});