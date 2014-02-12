//setup Dependencies
var connect = require('connect'),
    express = require('express'),
    io = require('socket.io'),
    http = require("http"),
    port = (process.env.PORT || 8081),
    server = express.createServer(),
    countdownInterval,
    totalConnections = 0,
    departures = [],
    totalBusJoins = [],
    nextDepartureInSeconds,
    nextDeparture,
    httpReqOptions = {
        host: 'transport.opendata.ch',
        port: 80,
        path: '/v1/connections?from=Zuerich%20Seerose&to=Zuerich%20Buerkliplatz&direct=1&transportations[]=bus&fields[]=connections/from/departure',
        method: 'GET'
    };

server.configure(function() {
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next) {
    if (err instanceof NotFound) {
        res.render('404.jade', {
            locals: {
                title: '404 - Not Found',
                description: '',
                author: '',
                analyticssiteid: 'XXXXXXX'
            },
            status: 404
        });
    } else {
        res.render('500.jade', {
            locals: {
                title: 'The Server Encountered an Error',
                description: '',
                author: '',
                analyticssiteid: 'XXXXXXX',
                error: err
        }, status: 500 });
    }
});

server.listen(port);

//Setup Socket.IO
io = io.listen(server);

/*
departures = [ '2014-01-29T22:21:00+0100',
    '2014-01-29T22:22:00+0100',
    '2014-01-29T22:23:00+0100',
    '2014-01-29T22:33:50+0100' ];
startCountdown();
*/

io.sockets.on('connection', function(socket) {
    totalConnections += 1;
    console.log('Client Nr. ' + totalConnections + ' Connected');

    socket.join('room');

    if (departures.length) {
        io.sockets.in('room').emit('new_departure_time_from_server', { "nextDepartureInSeconds": nextDepartureInSeconds, "nextDepartureInTimeformat": nextDeparture.toLocaleTimeString() });
    } else {
        loadDepartures();
    }

    emitTotalBusJoins();

    socket.on('join_the_bus_from_client', function() {
        // only add, if the same socket id does not exist yet
        if (totalBusJoins.some(function(socketId, index, array) {
            return socketId === socket.id;
        })) {
            return;
        } else {
            totalBusJoins.push(socket.id);
            emitTotalBusJoins();
        }
    });

    socket.on('disconnect', function() {
        totalConnections -= 1;
        console.log('Client Disconnected. ' + totalConnections + ' clients left');
    });

    function emitTotalBusJoins() {
        socket.broadcast.emit('total_bus_joins_from_server', totalBusJoins.length);
        socket.emit('total_bus_joins_from_server', totalBusJoins.length);
    }
});


function loadDepartures() {
    var req = http.request(httpReqOptions, function(res) {
        var jsonResponse;

        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            var val;

            jsonResponse = JSON.parse(chunk);
            departures = [];

            for (var i in jsonResponse.connections) {
                val = jsonResponse.connections[i];
                departures.push(val.from.departure);
            }
            console.log(departures);

            startCountdown();
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.end();
}

function startCountdown() {
    var curTime = new Date();

    totalBusJoins = [];

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    for (var i in departures) {
        console.log(curTime + ' / ' + new Date(departures[i]));
        if (curTime < new Date(departures[i])) {
            nextDeparture = new Date(departures[i]);
            nextDepartureInSeconds = Math.floor((nextDeparture.getTime() - curTime.getTime()) / 1000);

            io.sockets.in('room').emit('new_departure_time_from_server', { "nextDepartureInSeconds": nextDepartureInSeconds, "nextDepartureInTimeformat": nextDeparture.toLocaleTimeString() });

            countdownInterval = setInterval(function(e) {
                console.log(nextDepartureInSeconds);
                if (nextDepartureInSeconds === 0) {
                    console.log('NEXT DEPARTURE');
                    startCountdown();
                } else {
                    nextDepartureInSeconds -= 1;
                }
            }, 1000);

            return 2;
        } else {
            if (i == (departures.length -1)) {
                if (totalConnections > 0) {
                    loadDepartures();
                } else {
                    departures = [];
                }
            }
        }
    }
}


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function (req, res) {
    res.render('index.jade', {
        locals: {
            title: 'Bus Rush',
            description: 'Your next bus is departing in...',
            author: 'Renato Hotz',
            analyticssiteid: 'XXXXXXX'
        }
    });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function (req, res) {
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function (req, res) {
    throw new NotFound;
});

function NotFound(msg) {
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

console.log('Listening on http://0.0.0.0:' + port);


/*
{
    "connections":
    [
        {"from": {"departure": "2014-01-27T20:00:00+0100"}, "to": {"arrival": "2014-01-27T20:07:00+0100"}},
        {"from": {"departure": "2014-01-27T20:14:00+0100"}, "to": {"arrival": "2014-01-27T20:22:00+0100"}},
        {"from": {"departure": "2014-01-27T20:30:00+0100"}, "to": {"arrival": "2014-01-27T20:37:00+0100"}},
        {"from": {"departure": "2014-01-27T20:44:00+0100"}, "to": {"arrival": "2014-01-27T20:52:00+0100"}}
    ]
}
*/