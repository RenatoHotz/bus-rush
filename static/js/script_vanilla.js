/* Author: Renato Hotz
 */

document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect(),
        totalJoinsEl = document.querySelector('#totalJoins'),
        sectionNext = document.querySelector('#next'),
        departureTimeEl = document.querySelector('#departureTime'),
        departureTime2El = document.querySelector('#departureTime2'),
        countdownEl = document.querySelector('#countdown'),
        countdown2El = document.querySelector('#countdown2'),
        countdownInterval,
        counter,
        counter2;

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
        counter = data.departures[0].nextDepartureInSeconds;
        counter2 = data.departures[1].nextDepartureInSeconds;

        departureTimeEl.innerHTML = data.departures[0].nextDepartureInTimeformat.substr(0, 5);
        departureTime2El.innerHTML = data.departures[1].nextDepartureInTimeformat.substr(0, 5);
        countdownEl.innerHTML = secondsToTimeformat(counter);
        countdown2El.innerHTML = secondsToTimeformat(counter2);

        startCountdown();
    });

    /**
     * set the countdown interval
     */
    function startCountdown() {
        var actualTime,
            compareTime = new Date().getTime() / 1000;

        clearInterval(countdownInterval);

        // start countdown
        countdownInterval = setInterval(function() {
            actualTime = new Date().getTime() / 1000;

            if (actualTime - compareTime > 2) {
                socket.emit('request_departures_from_client');
                clearInterval(countdownInterval);
                countdownEl.innerHTML = 'loading';
                return;
            }

            compareTime = actualTime;

            if (counter > 0) {
                counter = counter - 1;
                counter2 = counter2 - 1;
            }

            countdownEl.innerHTML = secondsToTimeformat(counter);
            countdown2El.innerHTML = secondsToTimeformat(counter2);

            if (counter < 180) {
                countdownEl.className = 'hurry';
            } else if (counter < 360) {
                countdownEl.className = 'intermediate';
            } else {
                countdownEl.className = 'easy';
            }
        }, 1000);
    }

    /**
     * update join count
     */
    socket.on('total_bus_joins_from_server', function(totalBusJoins) {
        totalJoinsEl.innerHTML = totalBusJoins;
    });

    /**
     * creates time-formatted string from seconds
     * @param {int} secs
     * @returns {string}
     */
    function secondsToTimeformat(secs) {
        var t = new Date(1970, 0, 1);
        t.setSeconds(secs);

        return t.toTimeString().substr(0, 8);
    }






    socket.on('connect', function(data) {
        console.log(data + 'fasdf       ');
    });
});