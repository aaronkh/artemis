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
app.use(express.static('public'));

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
                "ready": bool,
                "votes": int
            }
        ],
        time: Date,
        ready: bool,
        phase: Enum
    }
}
*/

const PHASE = {
    WAITING: 'WAITING',
    PLAYING: 'PLAYING',
    VOTING: 'VOTING',
    FINISHED: 'FINISHED',
}

// check for existence of game
app.get('/game/:id/exists', (req, res) => {
    res.json({
        success: games.has(req.params.id),
    })
})

app.get('/game/:id/:uid/sign-out', (req, res) => {
    // Should prevent arbitrary people from signing others out
    const game = games.get(req.params.id)
    if (game) {
        const arr = game.players.filter((p) => p.uid === req.params.uid)
        if (arr.length === game.players.length)
            return res.json({ success: false })
        if (arr.length) {
            game.players = arr
            game.set(req.params.id, game)
        } else {
            games.delete(req.params.id)
        }
        return res.json({ success: false })
    }
})

// create game
app.post('/game', (req, res) => {
    // generate unique id
    const size = 4
    let id
    do {
        id = crypto
            .randomBytes(size)
            .toString('hex')
            .slice(0, size)
            .toUpperCase()
    } while (games.has(id))

    games.set(id, {
        players: [],
        time: new Date(),
        ready: false,
        phase: PHASE.WAITING,
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
    app.get('/debug', (_, res) => res.json(games))
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
            "votes": int
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
            votes: 0,
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

        if (games.get(game.id).phase !== PHASE.WAITING)
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
        if (!games.has(player.id))
            return socket.emit('error', {
                error: 'The game does not exist!',
            })

        if (games.get(player.id).phase !== PHASE.PLAYING)
            return socket.emit('error', {
                error: 'The game is stopped',
            })

        let current_players = games.get(player.id).players
        for (let i = 0; i < current_players.length; i++) {
            if (current_players[i].uid === player.uid) {
                games.get(player.id).players[i].code = player.code
                break
            }
        }
        io.in('/game/' + player.id + '/spectate').emit(
            'code',
            games.get(player.id)
        )
    })

    socket.on('unready', (player) => {
        if (!games.has(player.id))
            return socket.emit('error', {
                error: 'The game does not exist!',
            })

        if (games.get(player.id).phase !== PHASE.WAITING)
            return socket.emit('error', {
                error: 'The game has already started',
            })

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
        if (!games.has(player.id))
            return socket.emit('error', {
                error: 'The game does not exist!',
            })

        if (games.get(player.id).phase !== PHASE.WAITING)
            return socket.emit('error', {
                error: 'The game has already started',
            })

        let current_players = games.get(player.id).players
        let all_ready = true
        for (let i = 0; i < current_players.length; i++) {
            if (current_players[i].uid === player.uid) {
                games.get(player.id).players[i].ready = true //update the ready for the player that sent the ready signal
            }
            if (!games.get(player.id).players[i].ready) {
                all_ready = false //if any player is not ready set all ready to false so the all ready message isnt sent to the game room
            }
        }
        games.get(player.id).ready = all_ready

        // PLAYING
        if (all_ready) {
            let time_amount = 15 // 15 minutes
            let start_time = new Date()
            let end_time = new Date(
                start_time.getTime() + time_amount * 60 * 1000
            )

            games.get(player.id).start_time = start_time.toISOString()
            games.get(player.id).end_time = end_time.toISOString()
            games.get(player.id).phase = PHASE.PLAYING

            io.in('/game/' + player.id).emit('ready', games.get(player.id)) //sends the all ready signal to the game room with the received game id

            io.in('/game/' + player.id + '/spectate').emit(
                'ready',
                games.get(player.id)
            ) //sends the all ready signal to the game room with the received game id

            // VOTING
            setTimeout(() => {
                time_amount = 1 // 1 minute
                start_time = new Date()
                end_time = new Date(
                    start_time.getTime() + time_amount * 60 * 1000
                )
                games.get(player.id).phase = PHASE.VOTING
                games.get(player.id).start_time = start_time.toISOString()
                games.get(player.id).end_time = end_time.toISOString()

                io.in('/game/' + player.id).emit(
                    'game over',
                    games.get(player.id)
                )
                io.in('/game/' + player.id + '/spectate').emit(
                    'game over',
                    games.get(player.id)
                )

                // FINISHED
                setTimeout(() => {
                    games.get(player.id).phase = PHASE.FINISHED

                    io.in('/game/' + player.id).emit(
                        'voting over',
                        games.get(player.id)
                    )
                    io.in('/game/' + player.id + '/spectate').emit(
                        'voting over',
                        games.get(player.id)
                    )
                }, time_amount * 60 * 1000)
            }, time_amount * 60 * 1000)
        }
    })

    socket.on('vote', (player) => {
        /*
         * {
         *      "id": string, // game
         *      "uid": string // vote
         * }
         * */
        if (!games.has(player.id))
            return socket.emit('error', {
                error: 'The game does not exist!',
            })

        if (games.get(player.id).phase !== PHASE.VOTING)
            return socket.emit('error', {
                error: 'The game is not in the voting phase',
            })

        for (let p of games.get(player.id).players) {
            if (player.uid === p.uid) {
                return ++p.votes
            }
        }
    })

    socket.on('chat message', (msg) => {
        /* msg_data expected in the form of 
        {
            "id": string,
            "name": string,
            "message": string
        }
        */
        console.log(msg)
        socket.to('/game/' + msg.id + '/spectate').emit('chat message', msg)
    })

    socket.on('disconnect', () => {
        console.log('A player has disconencted')
    })
    //return true
})
