import { useEffect, useState } from 'react'
import { useParams, useRouteMatch, Link, Route, Switch } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'

import socket from '../../lib/socket'

import Frame, { FullFrame } from './frame'
import Chat from './chat/chat'

const PLAYERS = [
    {
        name: 'Devin',
        uid: 0,
    },
    {
        name: 'Aaron',
        uid: 1,
    },
    {
        name: 'Skylar',
        uid: 2,
    },
    {
        name: 'Crystal',
        uid: 3,
    },
]

function Game() {
    const { id } = useParams()
    const match = useRouteMatch()

    const [players, setPlayers] = useState(PLAYERS)

    useEffect(() => {
        const getGame = async () => {
            try {
                const res = await fetch(`/game/${id}/exists`)
                if (res.status >= 400)
                    throw new Error('Something went wrong...')

                const data = await res.json()
                if (!data.success) return toast.error('Game does not exist!')
                toast.success('Spectating game')
            } catch (e) {
                console.error(e)
                return toast.error('Something went wrong...')
            }
        }

        getGame()

        socket.on('code', (update) => {
            const uid = update.uid
            const code = update.code
            for (let i = 0; i < players.length; ++i) {
                if (players[i] === uid) {
                    players[i].code = code
                    break
                }
            }
            setPlayers([...players])
        })

        socket.on('game over', () => {})

        socket.on('voting over', () => {})

        return function cleanup() {
            socket.off('load game')
            socket.off('code')
            socket.off('game over')
            socket.off('voting over')
        }
    })

    return (
        <>
            <div class="container">
                <div class="row">
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

                    <Chat />
                </div>
            </div>
            <Toaster />
        </>
    )
}

function Gallery({ players }) {
    const match = useRouteMatch()
    let code = `
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
    `

    return (
        <div className="row">
            {players.map((player) => (
                <Link to={`${match.url}/screen/${player.uid}`}>
                    <Frame code={code} player={player} />
                </Link>
            ))}
        </div>
    )
}

function Focus({ path, players, code }) {
    const { player_id } = useParams()
    code = `
    <!doctype html>
    <html>
    <head>
    <style>
    h1 {
    color: red
    }
    </style>
    </head>
    <body>
    <h1>this is a test</h1>
    <h2>not really but</h2>
    <p>sometimes i am</p>
    </body>
    </html>
    `

    return (
        <>
            <div
                className="col-10"
                style={{
                    height: '100%',
                }}
            >
                <Link to={path}>Back</Link>
                <FullFrame code={code} player={players[player_id]} />
            </div>
        </>
    )
}

export default Game
