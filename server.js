
var path = require('path');
var createError = require('http-errors');
var express = require('express');
const mongoose = require('mongoose')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");

var app = express()

var http = require('http').Server(app)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
// Socket.io server listens to our app
var io = require('socket.io').listen(http);

// Send current time to all connected clients
function sendTime() {
    io.emit('time', { time: new Date().toJSON() });
}
app.get('/', function (req, res) {

    res.render("socky", { title: 'Page' });

});
// Send current time every 10 secs
setInterval(sendTime, 10000);

// Emit welcome message on connection
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {

    });
    socket.on('disconnect', function () {
        console.log('A user disconnected');
     });
});
http.listen(3200, function () {
    console.log('listening on *: 3200');
});