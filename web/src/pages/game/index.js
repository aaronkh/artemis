import { useEffect, useState } from 'react'
import { useParams, useRouteMatch, Link, Route, Switch } from 'react-router-dom'

import Frame, { FullFrame } from './frame'
import Chat from './chat/index'
import './Apps.css'

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

    return (
        <div>
            <div className = "chat"><Chat></Chat> </div>
            <div className="container">
                <h5>Time Left: 10:20</h5>
                <Route path={`${match.path}/screen/:player_id`}>
                    <Focus players={players} path={match.url} />
                </Route>
                <Route exact path={`${match.path}/`}>
                    <Gallery players={players} />    
                </Route>
            </div>
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
