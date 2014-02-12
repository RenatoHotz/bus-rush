var server = require("nodeserver"),
    router = require("router"),
    io = require("socket.io"),
    loader = require("loader");

server.start(router.route);
io.connect();
loader.load();