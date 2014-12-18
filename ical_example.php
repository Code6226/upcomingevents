<?php

header('Access-Control-Allow-Origin: http://localhost:8080');
header('Content-type: text/calendar; charset=utf-8');
header('Content-Disposition: inline; filename=calendar.ics');

echo file_get_contents('https://raw.githubusercontent.com/mozilla-comm/ical.js/master/samples/minimal.ics');