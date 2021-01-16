const express = require('express')
const path = require('path')
const cors = require('cors')

const app = express()

const HashMap = require('hashmap')
let games = new HashMap()

const PORT = process.env.PORT || 8080

app.use(express.json())

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

if (process.env.NODE_ENV === 'production') {
    // Serve React production bundle
    app.use(express.static(path.join(__dirname, 'build')))
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'))
    })
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'hello world!' })
    })
}

const server = app.listen(PORT, () =>
    console.log(`server started on port ${PORT}`)
)
const io = require('socket.io')(server, { origins: '*:*' })

/* Socket.io logic
 *
 */
io.on('connection', (socket) => {
    // Do something with the new socket
    // socket.on('event', () => {
    //      socket.emit('event name', {data: 1})
    // })
    console.log('A player has connected')
    socket.on('player join', (player_data) => {
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
        if (games.has(player_data.id)) {
            if (games.get(player_data.id).players.length < 8) {
                games.get(player_data.id).players.push(player_data.player)
            } else {
                console.log('ERROR: Game room full')
            }
        } else {
            console.log('Game id does not exist. Creating new game.')
            games.set(player_data.id, {
                id: player_data.id,
                players: [player_data.player],
                time: new Date(),
                ready: false,
            })
        }
    })

    // spectator
    socket.on('spectate', (game) => {
        /*
         * {
         *      id: string
         * }
         * */
        if (!games.get(game_id))
            return socket.emit('error', {
                error: 'game does not exist',
            })
        socket.join(`/game/${game_id}/spectate`)
    })

    socket.on('code update', (player_code) => {
        /* player code expected in the form of 
        {
            "id": string,
            "uid": string,
            "code": string
        }
        */
        let current_players = games.get(player_code.id).players
        for (let i = 0; i < current_players.length; i++) {
            if (current_players[i].uid == player_code.uid) {
                games.get(player_code.id).players[i].code = player_code.code
                socket
                    .to('/game/' + player_code.id + '/spectate')
                    .emit('code', {
                        uid: player_code.uid,
                        code: player_code.code,
                    })
                break
            }
        }
    })

    socket.on('ready', (msg) => {
        /* msg expected in the form of 
        {
            "id": string,
            "uid": string,
            "ready": bool
        }
        */
        let current_players = games.get(msg.id).players
        let all_ready = true
        for (let i = 0; i < current_players.length; i++) {
            if (current_players[i].uid == msg.ui) {
                games.get(msg.id).players[i].ready = msg.ready //update the ready for the player that sent the ready signal
            }
            if (!games.get(msg.id).players[i].ready) {
                all_ready = false //if any player is not ready set all ready to false so the all ready message isnt sent to the game room
            }
        }
        games.get(msg.id).ready = all_ready
        if (all_ready) {
            socket.to('/game/' + msg.id).emit('all ready') //sends the all ready signal to the game room with the received game id
        }
    })

    socket.on('chat message', (msg_data) => {
        /* msg_data expected in the form of 
        {
            "id": string,
            "uid": string,
            "msg": bool
        }
        */
        socket.to('/game/:' + msg_data.id).emit('chat message', msg_data)
        console.log('message: ' + msg)
    })

    socket.on('disconnect', () => {
        console.log('A player has disconencted')
    })
    //return true
})
