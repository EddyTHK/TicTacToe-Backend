// imports
const express = require('express');
var app = express();
const cors = require('cors');
const {nanoid} = require('nanoid');
const httpServer = require('http').createServer(app);

const Game = require('./logic/player.js');

// App setup
app.use(cors());

const io = require('socket.io')(httpServer, {
    cors:{
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 4000

httpServer.listen(port, function(){
    console.log('listening for requests on port',port);
});

app.use(function (req, res) {
    return res.sendStatus(200);
});

const lobbyInfo ={};
const sessionInfo={};

io.on('connection', (socket) => {
    console.log('Socket connected: ', socket.id);

    // Create Game (Player 1)
    socket.on('createSess', function(name){
        var sessionID = nanoid(10);
        console.log(sessionID);
        console.log('player 1 name: ' + name);

        const gameInfo = new Game(name,socket,sessionID);

        // Deconstructs lobbyInfo and binds the session id to game class
        lobbyInfo = {...lobbyInfo, [sessionID]:gameInfo};

        // Deconstructs sessionInfo and binds the socket to game class
        sessionInfo = {...sessionInfo,[socket]:gameInfo};
        
        socket.emit("session-created", {
            id: sessionID,
            name: name
        });

        // check if player 1 disconnected
        socket.on("disconnect", ()=> {
            try{
                socket.broadcast.emit("user-disconnected");
            }
            catch(err){
            }
            
            delete lobbyInfo[sessionID];
            delete sessionInfo[socket];
            console.log("session deleted");
        });
    });

    //Join Game (Player 2)
    socket.on("join-session", function(data) {
        var id = data.id;
        var name = data.name;
        console.log("sessionid: " + id);
        console.log("name: " + name);
        
        console.log("read id: " + lobbyInfo[sessionID])
        if (lobbyInfo[sessionID] == id) {
            Game.joinGame(name, id);

            socket.emit("GameStart");
        }else {
            socket.emit("errorInJoining");
        }

        // check if player 2 disconnected
        socket.on("disconnect", ()=> {
            try{
                socket.broadcast.emit("user-disconnected");
            }
            catch(err){
            }
            
            delete sessInfo[sessionID];
            console.log("session deleted");
        });
    });
});
