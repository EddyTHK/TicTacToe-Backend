// imports
const express = require('express');
const cors = require('cors');
const socket = require('socket.io');
const {nanoid}= require('nanoid');

const Game = require('../logic/player.js')

// App setup
var app = express();
app.use(cors());

app.use(function (req, res) {
    return res.sendStatus(200);
});

const port = process.env.PORT || 4000

var server = app.listen(port, function(){
    console.log('listening for requests on port 4000');
});

// Static files
app.use(express.static('../website'));

const sessInfo ={};

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('Socket connected: ', socket.id);

    // Create Game (Player 1)
    socket.on('createSess', function(name){
        var sessionID = nanoid(10);
        console.log(sessionID);
        console.log('username: ' + name);

        sessInfo[sessionID] = new Game(name,socket,sessionID);
        
        socket.emit("session-created", {
            id: sessionID,
            name: name
        });

        socket.on("disconnect", ()=> {
            try{
                socket.broadcast.emit("user-disconnected");
            }
            catch(err){
                ;
            }
            
            delete sessInfo[sessionID];
            console.log("session deleted");
        });
    });

    // TODO Join Game (Player 2)
    // socket.on("join-session", function(data) {

    // })
});
