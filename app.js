// imports
const express = require('express');
var app = express();
const cors = require('cors');
const { nanoid } = require('nanoid');
const httpServer = require('http').createServer(app);

var Game = require('./logic/player.js').Session;

// App setup
app.use(cors());

const io = require('socket.io')(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 4000

httpServer.listen(port, function () {
    console.log('listening for requests on port', port);
});

app.use(function (req, res) {
    return res.sendStatus(200);
});

var lobbyInfo = [];
var gameInfo = {};

io.on('connection', (socket) => {
    console.log('Socket connected: ', socket.id);

    // Create Game (Player 1)
    socket.on('createSess', function (name) {
        var sessionID = nanoid(10);
        console.log(sessionID);
        lobbyInfo.push(sessionID);
        console.log('player 1 name: ' + name);

        gameInfo[lobbyInfo[0]] = new Game(name, socket, sessionID);

        socket.emit("session-created", {
            id: sessionID,
            name: name
        });

        // check if player 1 disconnected
        socket.on("disconnect", () => {
            try {
                socket.broadcast.emit("user-disconnected");
            }
            catch (err) {
            }

            lobbyInfo.pop();
            console.log("Player 2 disconnected");
        });
    });


    socket.on('gameStart', function () {
        socket.emit("game",{
            joined: true
        });
        
        console.log('test');
    });

    //Join Game (Player 2)
    socket.on("join-session", function (data) {
        var id = data.id;
        var name = data.name;
        console.log("player 2 name: " + name);
        console.log(lobbyInfo);

        if (lobbyInfo.length) {
            for (var i = 0; i < lobbyInfo.length; i++) {
                if (lobbyInfo[i] == id) {
                    gameInfo[lobbyInfo[0]].joinGame(name, id);
                    socket.emit("joined");
                }
            }
        }else {
            socket.emit("errorInJoining");
        }
        

        // check if player 2 disconnected
        socket.on("disconnect", () => {
            try {
                socket.broadcast.emit("user-disconnected");
            }
            catch (err) {
            }

            lobbyInfo.pop();
            console.log("Player 2 disconnected");
        });
    });
});
