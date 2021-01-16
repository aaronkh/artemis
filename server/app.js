const express = require('express')
const cors = require('cors')

const app = express()
const sockServer = require('http').Server(app)
const io = require('socket.io')(sockServer, {origins: '*:*'})
app.use(express.json())

var HashMap = require('hashmap');
var games = new HashMap();
/*
games
{
    "id": {
        id: string,
        players:[
            {
                "name": string,
                "uid": string,
                "code": string,
                "ready": bool
            }
        ],
        time: Date,
        ready: bool
    }
}
*/

/* HTTP Methods 
 * 
 * app.get('/path', (req, res) => {
 *      // do stuff 
 *      res.send(200)
 *  })
 *
 * app.post('/path', (req, res) => {
 *      // do stuff 
 *      res.send(req.body)
 * })
 *
 * */

/* Socket.io logic
 *
 */
io.on('connection', socket => {
    // Do something with the new socket
    // socket.on('event', () => {
    //      socket.emit('event name', {data: 1})
    // })
    console.log("A player has connected");
    socket.on("player join", (player_data)=>{
        /* player data expected in the form of 
        {
            "id": string,
            "player":{
                "name": string,
                "uid": string,
                "code": string,
                "ready": bool 
            }
        }
        */
        if (games.has(player_data.id)){
            if(games.get(player_data.id).players.length<8){
                games.get(player_data.id).players.push(player_data.player);
            }
            else{
                throw "Too many players in game";
            }
            
        }
        else{
            console.log("Game id does not exist. Creating new game.");
            games.set(player_data.id, {
                id: player_data.id,
                players: [player_data.player],
                time: new Date(),
                ready: false
            })
        }
    })

    socket.on("code update", (player_code)=>{
        /* player code expected in the form of 
        {
            "id": string,
            "uid": string,
            "code": string
        }
        */
        current_players = games.get(player_code.id).players;
        for(let i = 0; i<current_players.length; i++){
            if (current_players[i].uid == player_code.uid){
                games.get(player_code.id).players[i].code = player_code.code;
                socket.to("/game/:"+player_code.id+"/spectate").emit("code", player_code.uid, player_code.code) //sends uid and code to spectator room
                break;
            }
        }
    })

    socket.on("ready", (msg)=>{
        /* msg expected in the form of 
        {
            "id": string,
            "uid": string,
            "ready": bool
        }
        */
        current_players = games.get(msg.id).players;
        all_ready = true;
        for(let i = 0; i<current_players.length; i++){
            if (current_players[i].uid == msg.ui){
                games.get(msg.id).players[i].ready = msg.ready; //update the ready for the player that sent the ready signal
            }
            if(!games.get(msg.id).players[i].ready){  
                all_ready = false; //if any player is not ready set all ready to false so the all ready message isnt sent to the game room
            }
        }
        games.get(msg.id).ready = all_ready; 
        if(all_ready){
            socket.to("/game/:"+msg.id).emit("all ready") //sends the all ready signal to the game room with the received game id
        }
    })

    socket.on("disconnect", ()=>{
        console.log("A player has disconencted");
    })
    //return true
})

io.listen(process.env.WSPORT || 5000)

app.listen(process.env.PORT || 8080, () => console.log('server started'))
