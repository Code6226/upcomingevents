'use strict';

angular.module('eventsApp').controller('MainCtrl', function ($scope, $interval, $routeParams) {
    $scope.events = [];

    $scope.location = $routeParams.location;

    $scope.fetchEvents = function(){
        console.log('fetch')
        $.ajax({
            url: "http://puchisoft.com/upcomingevents/ical.php"
        }).done(function(data) {

            var calDump = _.last(ICAL.parse(data));
            var eventsDump = _.filter(calDump, function(item){
                return item[0] === "vevent";
            });
            eventsDump = _.map(eventsDump, function(item){
                return item[1];
            });

            $scope.events = _.map(eventsDump, function(eventDump){
                function getTimeFromTS(ts){
                    // does not respect timezone, but this is only run in Canvs, so it's just local time there
                    // if needed, the timezone string can be found next to the events, and could probably be understood by momentjs-timezones
                    return moment(ts).unix();
                }
                function getValueForKey(key){ // key including :
                    return _.last(_.find(eventDump, {0: key}));
                }

                return {
                    name: getValueForKey('summary'),
                    location: getValueForKey('location'),
                    description: getValueForKey('description'),
                    unixStart: getTimeFromTS(getValueForKey('dtstart')),
                    unixEnd: getTimeFromTS(getValueForKey('dtend'))
                };
            });
            // only for this location
            $scope.events = _.filter($scope.events, {location: $scope.location});

            $scope.refreshCurrentEvent();
            $scope.$apply();
        });
    };

    $scope.refreshCurrentEvent = function(){
        console.log('refresh')
        $scope.easterEgg = false;
        var unixCur = moment().unix();
        $scope.currentEvent = _.find($scope.events, function(event){
            return event.unixStart <= unixCur && event.unixEnd >= unixCur;
        });

        $scope.upcomingEvents = _.filter($scope.events, function(event){
            return event.unixStart >= unixCur;
        });

    };


    $scope.isUpcomingEventOnNewDate = function(index){
        var prevEvent = $scope.upcomingEvents[index - 1];
        if(!prevEvent) { return true;}
        var curEvent = $scope.upcomingEvents[index];
        return !curEvent || moment.unix(prevEvent.unixStart).format('YYYYMMDD') !== moment.unix(curEvent.unixStart).format('YYYYMMDD');
    };

    $scope.isUnixToday = function (unix) {
        return moment.unix(unix).format('YYYYMMDD') === moment().format('YYYYMMDD');
    };

    $scope.formatUnix = function(unix, format){
        return moment.unix(unix).format(format);
    };
    $scope.formatNow = function(format){
        return moment().format(format);
    };


    $interval(function(){
        $scope.refreshCurrentEvent();
    },5*1000);

    $interval(function(){
        $scope.fetchEvents();
    },10*60*1000);

    $scope.fetchEvents();
});
