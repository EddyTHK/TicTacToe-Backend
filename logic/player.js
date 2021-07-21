module.exports = class Game{
    player1Info;
    player2Info;

    game = {
        player1Name: "",
        player2Name : "",
        player1Score: 0,
        player2Score: 0,
        ties : 0,
        player1Turn: true,
        board: [
            0,0,0,
            0,0,0,
            0,0,0,
        ]
    }

    constructor(name, info, sessID) {
        this.player1Name = name;
        this.player1Info = info;
        this.sessID = sessID;
    }

    JoinGame=(name,info)=>{
        this.gameState.player2Name = name;
        this.player2Info = info;
    }
}



