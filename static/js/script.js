/* Author: Renato Hotz
 */

$(document).ready(function () {
    var socket = io.connect(),
        countdownInterval;

    $('#join').on('click', function() {
        socket.emit('join_the_bus_from_client');
    });

    $('.more').on('click', function() {
        $(this).html('-')
        $('#next').toggle();
    });

    socket.on('new_departure_time_from_server', function(data) {
        console.log(data);
        var counter = data.departures[0].nextDepartureInSeconds;
        var counter2 = data.departures[1].nextDepartureInSeconds;

        $('#departureTime').text(data.departures[0].nextDepartureInTimeformat.substr(0, 5));
        $('#departureTime2').text(data.departures[1].nextDepartureInTimeformat.substr(0, 5));

        clearInterval(countdownInterval);

        countdownInterval = setInterval(function(e) {
            if (counter > 0) {
                counter = counter - 1;
                counter2 = counter2 - 1;
            }
            //console.log(counter);

            $('#countdown').text(secondsToTimeformat(counter));
            $('#countdown2').text(secondsToTimeformat(counter2));

            if (counter < 180) {
                $('#countdown').attr('class', 'hurry');
            } else if (counter < 360) {
                $('#countdown').attr('class', 'intermediate');
            } else {
                $('#countdown').attr('class', 'easy');
            }

            //$('#countdown') 0, 128, 0 -> 255, 0, 0
            /*var colorname = 'rgb('+r+','+g+','+b+')';
            el.style.setProperty(property, colorname);*/
        }, 1000);
    });

    socket.on('total_bus_joins_from_server', function(totalBusJoins) {
        //console.log(totalBusJoins);
        $('#totalJoins').html(totalBusJoins);
    });

    function secondsToTimeformat(secs) {
        var t = new Date(1970, 0, 1);

        t.setSeconds(secs);

        return t.toTimeString().substr(0, 8);
    };
});