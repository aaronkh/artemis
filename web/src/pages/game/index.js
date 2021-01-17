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

import PLAYERS from './players'

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
    const [phase, setPhase] = useState(PHASE.FINISHED)
    const [voted, setVoted] = useState(false)

    // const [players, setPlayers] = useState([])

    useEffect(() => {
        // clear interval
        let timer

        const createTimer = (game) => {
            // in seconds
            const diff = Math.abs((new Date(game.end_time) - new Date()) / 1000)
            setTimeLeft(diff)
            return setInterval(timerUpdate, 1000)
        }

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

                socket.on('error', ({ error }) => {
                    toast.error(error)
                })

                socket.on('ready', (game) => {
                    timer = createTimer(game)
                    setPhase(PHASE.PLAYING)
                    setPlayers([...game.players])
                    toast('Starting game')
                })

                socket.on('code', (game) => {
                    // joined midway in game
                    if (phase === PHASE.WAITING) {
                        timer = createTimer(game)
                        setPhase(PHASE.PLAYING)
                    }
                    setPlayers([...game.players])
                })

                socket.on('game over', (game) => {
                    // retrieve new voting times
                    timer = createTimer(game)

                    setPhase(PHASE.VOTING)

                    setPlayers([...game.players])
                    toast('The game is over! Voting has started')
                })

                socket.on('voting over', (game) => {
                    clearInterval(timer)
                    setPhase(PHASE.FINISHED)
                    setPlayers([...game.players])
                    toast('The votes are in')
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
            socket.off('code')
            socket.off('game over')
            socket.off('voting over')
        }
    }, [])

    const Status = () => {
        switch (phase) {
            case PHASE.WAITING:
                return <p>Waiting for all players to ready up...</p>
            case PHASE.PLAYING:
                return <p>Time Left: {timeLeft}</p>
            case PHASE.VOTING:
                return <p>Time to Vote!</p>
            case PHASE.FINISHED:
                return <p>The Votes are in!</p>
            default:
                break
        }
    }

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
                        <Status />
                        <Switch>
                            <Route path={`${match.path}/screen/:player_id`}>
                                <Focus
                                    players={players}
                                    path={match.url}
                                    phase={phase}
                                />
                            </Route>

                            <Route exact path={`${match.path}/`}>
                                <Gallery
                                    players={players}
                                    phase={phase}
                                    voted={voted}
                                    onVote={(p) => {
                                        toast.success(
                                            `You've voted for ${p.name}'s design`
                                        )
                                        setVoted(true)
                                        p.id = id
                                        socket.emit('vote', p)
                                    }}
                                />
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

function Gallery({ players, phase, voted, onVote }) {
    const match = useRouteMatch()
    return (
        <div className="row">
            {players.map((player) => (
                <Frame
                    player={player}
                    phase={phase}
                    to={`${match.url}/screen/${player.uid}`}
                    voted={voted}
                    onVote={(p) => {
                        onVote(p)
                    }}
                />
            ))}
        </div>
    )
}

function Focus({ path, players, phase }) {
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
            <FullFrame player={players[player_id]} phase={phase} path={path} />
        </>
    )
}

export default Game
