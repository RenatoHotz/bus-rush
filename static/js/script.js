/* Author: Renato Hotz
 */

$(document).ready(function () {
    var socket = io.connect(),
        countdownInterval;

    $('#join').bind('click', function() {
        socket.emit('join_the_bus_from_client');
    });

    socket.on('new_departure_time_from_server', function(data) {
        var counter = data.nextDepartureInSeconds;

        $('#departureTime').text(data.nextDepartureInTimeformat.substr(0, 5));

        clearInterval(countdownInterval);

        countdownInterval = setInterval(function(e) {
            if (counter > 0) {
                counter = counter - 1;
            }
            //console.log(counter);

            $('#countdown').text(secondsToTimeformat(counter));

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