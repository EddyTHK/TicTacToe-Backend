// imports
const express = require('express');
var app = express();
const cors = require('cors');
const { nanoid } = require('nanoid');
const httpServer = require('http').createServer(app);

var roomNo = 0;
var roomID;
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

io.on('connection', (socket) => {
    console.log('Socket connected: ', socket.id);

    // Create Game (Player 1)
    socket.on('createSess', function (data) {
        ++roomNo
        roomID = 'room-' + roomNo
        var player1Name = data.name;

        // create and send player 1 to a room
        socket.join(roomID);
        console.log('player 1: ' + player1Name + " joined " + roomID + "!");

        io.emit("session-created", {
            name: player1Name,
            room: roomID
        });

        socket.on('updated', function (data) {
            var tile = data.tile;
            var type = data.type;

            console.log(tile, type)
            socket.to(roomID).emit('swap', {
                tile: tile,
                type: type
            });
        });

        // check if player 1 disconnected
        socket.on("disconnect", () => {
            socket.broadcast.emit('user-disconnected');
            socket.leave(roomID);
            --roomNo

            console.log("Player 1 disconnected");
        });
    });

    //Join Game (Player 2)
    socket.on("join-session", function (data) {
        var player2Name = data.player2Name;

        // retrieves the number of client(s) in the room
        var client = io.sockets.adapter.rooms.get(`${data.room}`);
        const numClient = client ? client.size : 0;

        // check if roomNo and number in room is 1 
        if (numClient == 1) {
            // let the user join the room
            socket.join(data.room);
            console.log('player 2: ' + player2Name + " joined " + data.room + "!");

            //let the client know that player 2 successfully joined the room
            io.to(data.room).emit("joined", {
                name: player2Name,
                room: data.room
            });

            socket.on('updated', function (data) {
                var tile = data.tile;
                var type = data.type;

                console.log(tile, type)
                socket.to(roomID).emit('swap', {
                    tile: tile,
                    type: type
                });
            });
            
        } else {
            socket.on("errorInJoining", {
                error: "Error in joining! This room is already full."
            });
        }

        // check if player 2 disconnected
        socket.on("disconnect", () => {
            socket.broadcast.emit('user-disconnected');
            socket.leave(client);

            console.log("Player 2 disconnected");
        });
    });
});
