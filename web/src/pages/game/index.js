import { useEffect, useState } from 'react'
import { useParams, useRouteMatch, Link, Route, Switch } from 'react-router-dom'

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
        socket.emit('load game', {
            id: id,
        })

        socket.on('load game', (game) => {
            setPlayers(game.players)
        })

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
       
            
            <div className="container">
                <Chat /> 
                <h5>Time Left: 10:20</h5>
                <Route path={`${match.path}/screen/:player_id`}>
                    <Focus players={players} path={match.url} />
                </Route>
                
                <Route exact path={`${match.path}/`}>
                    <Gallery players={players} />
                </Route>
            </div>
           

    
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
    const { player_id } = useParams()

    return (
        <>
            <Link to={path}>Back</Link>
            <FullFrame player={players[player_id]} />
        </>
    )
}

export default Game
