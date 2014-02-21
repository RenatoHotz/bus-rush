/* Author: Renato Hotz
 */

document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect(),
        totalJoinsEl = document.querySelector('#totalJoins'),
        sectionNext = document.querySelector('#next'),
        departureTimeEl = document.querySelector('#departureTime'),
        departureTime2El = document.querySelector('#departureTime2'),
        countdowntEl = document.querySelector('#countdown'),
        countdownt2El = document.querySelector('#countdown2'),
        countdownInterval;

    /**
     * join this departure
     */
    document.querySelector('#join').addEventListener('click', function() {
        socket.emit('join_the_bus_from_client');
    });

    /**
     * toggle next departure
     */
    document.querySelector('.more').addEventListener('click', function(e) {
        e.preventDefault();

        if (sectionNext.classList.contains('invisible')) {
            this.innerHTML = '-';
        } else {
            this.innerHTML = '+';
        }
        sectionNext.classList.toggle('invisible');
    });

    /**
     * retrieve new departure-times
     */
    socket.on('new_departure_time_from_server', function(data) {
        console.log(data);
        var counter = data.departures[0].nextDepartureInSeconds;
        var counter2 = data.departures[1].nextDepartureInSeconds;

        departureTimeEl.innerHTML = data.departures[0].nextDepartureInTimeformat.substr(0, 5);
        departureTime2El.innerHTML = data.departures[1].nextDepartureInTimeformat.substr(0, 5);

        clearInterval(countdownInterval);

        // start countdown
        countdownInterval = setInterval(function(e) {
            if (counter > 0) {
                counter = counter - 1;
                counter2 = counter2 - 1;
            }

            countdowntEl.innerHTML = secondsToTimeformat(counter);
            countdownt2El.innerHTML = secondsToTimeformat(counter2);

            if (counter < 180) {
                countdowntEl.className = 'hurry';
            } else if (counter < 360) {
                countdowntEl.className = 'intermediate';
            } else {
                countdowntEl.className = 'easy';
            }
        }, 1000);
    });

    /**
     * update join count
     */
    socket.on('total_bus_joins_from_server', function(totalBusJoins) {
        totalJoinsEl.innerHTML = totalBusJoins;
    });

    function secondsToTimeformat(secs) {
        var t = new Date(1970, 0, 1);

        t.setSeconds(secs);

        return t.toTimeString().substr(0, 8);
    };

});