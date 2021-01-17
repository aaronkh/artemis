const express = require('express')
const path = require('path')
const cors = require('cors')
const HashMap = require('hashmap')
const crypto = require('crypto')

const app = express()

let games = new HashMap()

const PORT = process.env.PORT || 8080

app.use(cors())
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

// check for existence of game
app.get('/game/:id/exists', (req, res) => {
    res.json({
        success: games.has(req.params.id),
    })
})

// create game
app.post('/game', (req, res) => {
    // generate unique id
    const size = 4
    let id
    do {
        id = crypto.randomBytes(size).toString('hex').slice(0, size)
    } while (games.has(id))

    games.set(id, {
        players: [],
        time: new Date(),
        ready: false,
    })
    res.json({
        game: id,
    })
})

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
    socket.on('join', (player) => {
        /* player data expected in the form of 
        {
            "id": string,
            "name": string,
            "uid": string,
            "code": string,
            "ready": bool 
        }
        */
        const room_size = 8
        if (!games.has(player.id))
            return socket.emit('error', { error: 'The game does not exist' })

        if (games.get(player.id).players.length >= room_size)
            return socket.emit('error', { error: 'The game room is full' })

        const player_object = {
            name: player.name,
            uid: socket.id,
            code: '',
            ready: false,
        }
        games.get(player.id).players.push(player_object)
        socket.join(`/game/${player.id}`)
    })

    // spectators
    socket.on('spectate', (game) => {
        /*
         * {
         *      id: string
         * }
         * */
        if (!games.get(game.id))
            return socket.emit('error', {
                error: "The game doesn't exist!",
            })
        console.log(`spectating ${game.id}`)
        socket.join(`/game/${game.id}/spectate`)
        socket.emit('code', games.get(game.id))
    })

    socket.on('code update', (player) => {
        /* player code expected in the form of 
        {
            "id": string, // game id
            "uid": string,
            "code": string
        }
        */
        let current_players = games.get(player.id).players
        for (let i = 0; i < current_players.length; i++) {
            if (current_players[i].uid === player.uid) {
                games.get(player.id).players[i].code = player.code
                break
            }
        }
        io.to('/game/' + player.id + '/spectate').emit(
            'code',
            games.get(player.id)
        )
    })
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('unready', (player) => {
        for (let p of games.get(player.id).players) {
            if (p.uid === player.uid) return (p.ready = false)
        }
    })

    socket.on('ready', (player) => {
        /* msg expected in the form of 
        {
            "id": string, // game
            "uid": string,
            "ready": bool
        }
        */
        let current_players = games.get(player.id).players
        let all_ready = true
        for (let i = 0; i < current_players.length; i++) {
            if (current_players[i].uid === player.ui) {
                games.get(player.id).players[i].ready = player.ready //update the ready for the player that sent the ready signal
            }
            if (!games.get(player.id).players[i].ready) {
                all_ready = false //if any player is not ready set all ready to false so the all ready message isnt sent to the game room
            }
        }
        games.get(player.id).ready = all_ready
        if (all_ready) {
            let time_amount = 900000 // 15 minutes
            const start_time = new Date()
            let end_time = start_time
            end_time.setMinutes(end_time.getMinutes() + time_amount / 60 / 1000)

            io.to('/game/' + player.id).emit('ready', {
                start_time: start_time.toISOString(),
                end_time: end_time.toISOString(),
            }) //sends the all ready signal to the game room with the received game id

            setTimeout(() => {
                io.to('/game/' + player.id).emit('game over')
                io.to('/game/' + player.id + '/spectate').emit('game over')
                time_amount = 60000 // 1 minute
                setTimeout(() => {
                    io.to('/game/' + player.id).emit('voting over')
                    io.to('/game/' + player.id + '/spectate').emit(
                        'voting over'
                    )
                }, time_amount)
            }, time_amount)
        }
    })

    socket.on('chat message', (msg_data) => {
        /* msg_data expected in the form of 
        {
            "id": string,
            "name": string,
            "msg": bool
        }
        */
        io.to('/game/' + msg_data.id).emit('chat message', msg_data)
        console.log('message: ' + msg_data.msg)
    })

    socket.on('disconnect', () => {
        console.log('A player has disconencted')
    })
    //return true
})
