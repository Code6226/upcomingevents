var PARSE_CONST={
    BEGIN_EVENT: 'BEGIN:VEVENT',
    TIME_START: 'DTSTART',
    TIME_END: 'DTEND',
    DATE_PRE: 'DATE-TIME:',
};

$.ajax({
    url: "http://puchisoft.com/upcomingevents/ical.php"
}).done(function(data) {
    console.log( "done" );
    // does not understand the dates format
    //var parsed = $.icalendar.parse(data);

    // ugly, but works
    var eventsDump = data.split(PARSE_CONST.BEGIN_EVENT).splice(1);
    var events = _.map(eventsDump, function(eventDump){
        function getTimeAfterIndex(index){
            var indexDate = eventDump.indexOf(PARSE_CONST.DATE_PRE, index) + PARSE_CONST.DATE_PRE.length;
            var startTimestamp = eventDump.substring(indexDate, indexDate + 15);

            // does not respect timezone, but this is only run in Canvs, so it's just local time there
            return moment()
                .year(startTimestamp.substring(0,4))
                .month(startTimestamp.substring(5,7))
                .date(startTimestamp.substring(6,8))
                .hour(startTimestamp.substring(9,11))
                .minute(startTimestamp.substring(12,14))
                .second(0)
                .format();
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
            momentStart: getTimeAfterIndex(indexStart),
            momentEnd: getTimeAfterIndex(indexEnd)
        };
    });
    console.log(events);


});
