import { useEffect, useState } from 'react'
import {
    useHistory,
    useParams,
    useRouteMatch,
    Link,
    Route,
    Switch,
} from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'

import socket from '../../lib/socket'

import Frame, { FullFrame } from './frame'
import Chat from './chat'

const PLAYERS = [
    {
        name: 'Devin',
        uid: 0,
        code: `
    <!doctype html>
    <html>
    <head>
    </head>
    <body>
    <h1>this is not a test</h1>
    <h2>not really but</h2>
    <p>sometimes i am</p>
    </body>
    </html>
    `,
    },
    {
        name: 'Aaron',
        uid: 1,
        code: `
    <!doctype html>
    <html>
    <head>
    </head>
    <body>
    <h1>this is a test</h1>
    <h2>not really but</h2>
    <p>sometimes i am</p>
    </body>
    </html>
    `,
    },
    {
        name: 'Skylar',
        uid: 2,
        code: `
    <!doctype html>
    <html>
    <head>
    </head>
    <body>
    <h1>this is a test</h1>
    <h2>not really but</h2>
    <p>sometimes i am</p>
    </body>
    </html>
    `,
    },
    {
        name: 'Crystal',
        uid: 3,
        code: `
    <!doctype html>
    <html>
    <head>
    </head>
    <body>
    <h1>this is a test</h1>
    <h2>not really but</h2>
    <p>sometimes i am</p>
    </body>
    </html>
    `,
    },
]

const PHASE = {
    WAITING: 'WAITING',
    PLAYING: 'PLAYING',
    VOTING: 'VOTING',
    FINISHED: 'FINISHED',
}

function Game() {
    const { id } = useParams()
    const match = useRouteMatch()

    const [timeLeft, setTimeLeft] = useState(-1)
    const [players, setPlayers] = useState(PLAYERS)
    const [phase, setPhase] = useState(PHASE.WAITING)
    // const [players, setPlayers] = useState([])

    useEffect(() => {
        // clear interval
        let timer

        const timerUpdate = () => {
            if (timeLeft > 0) setTimeLeft(timeLeft - 1)
        }

        const getGame = async () => {
            try {
                const res = await fetch(`/game/${id}/exists`)
                if (res.status >= 400)
                    throw new Error('Something went wrong...')

                const data = await res.json()
                if (!data.success) return toast.error('Game does not exist!')
                toast.success('Spectating game')

                // join room
                socket.emit('spectate', {
                    id: id,
                })

                socket.on('ready', (game) => {
                    // in seconds
                    const diff = Math.abs(
                        (new Date(game.end_time) - new Date()) / 1000
                    )
                    setTimeLeft(diff)
                    timer = setInterval(timerUpdate, 1000)
                })

                socket.on('code', (game) => {
                    // joined midway in game
                    if (phase === PHASE.WAITING) {
                        const diff = Math.abs(
                            (new Date(game.end_time) - new Date()) / 1000
                        )
                        setTimeLeft(diff)
                        timer = setInterval(timerUpdate, 1000)
                        setPhase(PHASE.PLAYING)
                    }
                    const p = game.players
                    // setPlayers([...p])
                })

                socket.on('game over', (game) => {
                    // retrieve new voting times
                    const diff = Math.abs(
                        (new Date(game.end_time) - new Date()) / 1000
                    )
                    setTimeLeft(diff)
                    timer = setInterval(timerUpdate, 1000)

                    setPhase(PHASE.VOTING)
                })

                socket.on('voting over', () => {
                    clearInterval(timer)
                    setPhase(PHASE.FINISHED)
                })
            } catch (e) {
                console.error(e)
                return toast.error('Something went wrong...')
            }
        }

        getGame()
        return function cleanup() {
            // clear timer if set
            if (!(phase === PHASE.WAITING || phase === PHASE.FINISHED))
                clearInterval(timer)
            socket.off('load game')
            socket.off('code')
            socket.off('game over')
            socket.off('voting over')
        }
    }, [])

    return (
        <>
            <div
                className="container"
                style={{
                    height: '100%',
                }}
            >
                <div
                    className="row"
                    style={{
                        height: '100%',
                    }}
                >
                    <div
                        className="container"
                        style={{
                            height: '100%',
                        }}
                    >
                        <h5>Time Left: 10:20</h5>
                        <Switch>
                            <Route path={`${match.path}/screen/:player_id`}>
                                <Focus players={players} path={match.url} />
                            </Route>

                            <Route exact path={`${match.path}/`}>
                                <Gallery players={players} />
                            </Route>
                        </Switch>
                    </div>

                    <Chat id={id} />
                </div>
            </div>
            <Toaster />
        </>
    )
}

function Gallery({ players }) {
    const match = useRouteMatch()
    return (
        <div className="row">
            {players.map((player) => (
                <Link to={`${match.url}/screen/${player.uid}`}>
                    <Frame player={player} />
                </Link>
            ))}
        </div>
    )
}

function Focus({ path, players }) {
    const history = useHistory()
    const { player_id } = useParams()

    useEffect(() => {
        for (const player of players) {
            if (player.uid === Number(player_id)) return
        }
        history.push(path)
    }, [])

    return (
        <>
            <div
                className="col-10"
                style={{
                    height: '100%',
                }}
            >
                <Link to={path}>Back</Link>
                <FullFrame player={players[player_id]} />
            </div>
        </>
    )
}

export default Game
