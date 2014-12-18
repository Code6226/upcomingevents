angular.module('eventsApp').controller('MainCtrl', function ($scope, $interval) {
    var PARSE_CONST={
        BEGIN_EVENT: 'BEGIN:VEVENT',
        TIME_START: 'DTSTART',
        TIME_END: 'DTEND',
        DATE_PRE: 'DATE-TIME:'
    };

    $scope.events = [];

    $scope.fetchEvents = function(){
        console.log('fetch')
        $.ajax({
            url: "http://puchisoft.com/upcomingevents/ical.php"
        }).done(function(data) {
            // jquery ical does not understand the dates format
            //var parsed = $.icalendar.parse(data);

            // ugly...
            var eventsDump = data.split(PARSE_CONST.BEGIN_EVENT).splice(1);
            $scope.events = _.map(eventsDump, function(eventDump){
                function getTimeAfterIndex(index){
                    var indexDate = eventDump.indexOf(PARSE_CONST.DATE_PRE, index) + PARSE_CONST.DATE_PRE.length;
                    var startTimestamp = eventDump.substring(indexDate, indexDate + 15);

                    // does not respect timezone, but this is only run in Canvs, so it's just local time there
                    return moment()
                        .year(startTimestamp.substring(0,4))
                        .month(startTimestamp.substring(5,7) - 1)
                        .date(startTimestamp.substring(6,8))
                        .hour(startTimestamp.substring(9,11))
                        .minute(startTimestamp.substring(12,14))
                        .second(0)
                        .unix();
                }

                function getValueForKey(key){ // key including :
                    var item = _.find(eventDump.split('\n'), function(item){
                        return item.substring(0, key.length) === key;
                    });
                    if(item){
                        return item.substring(key.length);
                    }
                }

                var indexStart = eventDump.indexOf(PARSE_CONST.TIME_START);
                var indexEnd = eventDump.indexOf(PARSE_CONST.TIME_END);

                return {
                    name: getValueForKey('SUMMARY:'),
                    location: getValueForKey('LOCATION:'),
                    unixStart: getTimeAfterIndex(indexStart),
                    unixEnd: getTimeAfterIndex(indexEnd)
                };
            });
            $scope.refreshCurrentEvent();
            $scope.$apply();
        });
    };

    $scope.refreshCurrentEvent = function(){
        console.log('refresh current')
        var unixCur = moment().unix();
        $scope.currentEvent = _.find($scope.events, function(event){
            return event.unixStart <= unixCur && event.unixEnd >= unixCur;
        });

        $scope.upcomingEvents = _.filter($scope.events, function(event){
            return true || event.unixStart >= unixCur;
        });

    };

    $scope.formatUnix = function(unix, format){
        return moment.unix(unix).format(format);
    };


    $interval(function(){
        $scope.refreshCurrentEvent();
    },30*1000);

    $interval(function(){
        $scope.fetchEvents();
    },10*60*1000);

    $scope.fetchEvents();
});
