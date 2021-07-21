// imports
const express = require('express');
var app = express();
const cors = require('cors');
const {nanoid} = require('nanoid');
const httpServer = require('http').createServer(app);

const Game = require('../logic/player.js')

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

const sessInfo ={};

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
