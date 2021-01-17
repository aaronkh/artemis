import { useEffect, useState } from 'react'
import {
    useHistory,
    useParams,
    useRouteMatch,
    Route,
    Switch,
} from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'

import socket from '../../lib/socket'

import { useStore, useDispatch } from 'react-redux'
import { join } from '../../redux/game'

import Modal from 'react-modal'
import Frame, { FullFrame } from './frame'
import Chat from './chat'

// import PLAYERS from './players'

const PHASE = {
    WAITING: 'WAITING',
    PLAYING: 'PLAYING',
    VOTING: 'VOTING',
    FINISHED: 'FINISHED',
}

function Game() {
    const { id } = useParams()
    const match = useRouteMatch()
    const history = useHistory()
    const dispatch = useDispatch()
    const store = useStore()

    const [timeLeft, setTimeLeft] = useState(0)
    const [name, setName] = useState('')

    // const [players, setPlayers] = useState(PLAYERS)
    const [players, setPlayers] = useState([])
    const [game, setGame] = useState({})
    const [phase, setPhase] = useState(PHASE.WAITING)
    const [voted, setVoted] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [refresh, setRefresh] = useState(true)

    useEffect(() => {
        switch (phase) {
            case PHASE.WAITING:
                document.title = 'Coding in the Dark | Waiting...'
                break
            case PHASE.PLAYING:
                document.title = 'Coding in the Dark | Battle!'
                break
            case PHASE.VOTING:
                document.title = 'Coding in the Dark | Vote for your favorite'
                break
            case PHASE.FINISHED:
                document.title = 'Coding in the Dark | Results'
                break
            default:
                break
        }
    })

    useEffect(() => {
        // save clear interval
        let timer

        const createTimer = (game) => {
            // in seconds
            const diff = Math.round(
                (new Date(game.end_time) - new Date()) / 1000
            )
            setTimeLeft(diff)
            return setInterval(timerUpdate, 1000)
        }

        const timerUpdate = () => {
            if (timeLeft > 0) setTimeLeft(timeLeft - 1)
        }

        const getGame = async () => {
            setRefresh(true)
            try {
                const res = await fetch(`/game/${id}/exists`)
                if (res.status >= 400)
                    throw new Error('Something went wrong...')

                const data = await res.json()
                if (!data.success) {
                    toast.error('Game does not exist!')
                    return history.push('/')
                }
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
                    setGame(game)
                    toast('Starting game')
                })

                socket.on('code', (game) => {
                    // joined midway in game
                    if (phase === PHASE.WAITING) {
                        timer = createTimer(game)
                        setPhase(game.phase)
                        setGame(game)
                    }
                    setPlayers([...game.players])
                    setRefresh(false)
                })

                socket.on('game over', (game) => {
                    // retrieve new voting times
                    clearInterval(timer)
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

        if (!store.getState().game.name) setModalOpen(true)

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

    const onNameSubmit = () => {
        if (!name) return toast.error('Name is empty!')
        dispatch(
            join({
                name: name,
            })
        )
        setModalOpen(false)
    }

    const onNameChange = (e) => {
        setName(e.target.value)
    }

    const Status = () => {
        const s = timeLeft % 60
        const m = Math.floor(timeLeft / 60)
        let t = m + ':'
        if (s === 0) t += '00'
        else if (s < 10) t += '0' + s
        else t += s
        switch (phase) {
            case PHASE.WAITING:
                return <p>Waiting for all players to ready up...</p>
            case PHASE.PLAYING:
                return <p>{t} min left</p>
            case PHASE.VOTING:
                return <p>Time to Vote! ({t} min left)</p>
            case PHASE.FINISHED:
                return <p>The Votes are in!</p>
            default:
                break
        }
    }

    if (refresh)
        return (
            <div className="loader">
                <Loader
                    type="TailSpin"
                    color="#3b42bf"
                    height={100}
                    width={100}
                    timeout={6000}
                />
            </div>
        )

    return (
        <>
            <DialogModal
                modalOpen={modalOpen}
                name={name}
                onChange={(e) => onNameChange(e)}
                onSubmit={onNameSubmit}
            />
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
                                    game={game}
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

function Gallery({ players, game, phase, voted, onVote }) {
    const match = useRouteMatch()

    if (!players.length)
        return (
            <>
                <p>
                    There's no one here yet.{' '}
                    <a
                        href="https://marketplace.visualstudio.com/items?itemName=aaronkh.coding-in-the-dark"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Join the battle
                    </a>{' '}
                    on VS Code!
                </p>
            </>
        )

    return (
        <>
            {phase !== PHASE.WAITING && (
                <>
                    <a href={`${game.image}`} target="_blank" rel="noreferrer">
                        <img
                            alt="Website Screenshot"
                            src={game.image}
                            className="img-fluid"
                            style={{
                                width: '50%',
                                display: 'block',
                                margin: '0 auto',
                            }}
                        />
                    </a>
                    <p
                        className="text-center"
                        style={{
                            marginTop: '15px',
                        }}
                    >
                        Goal
                    </p>
                </>
            )}
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
        </>
    )
}

function Focus({ path, players, phase }) {
    const history = useHistory()
    const { player_id } = useParams()
    const [player, setPlayer] = useState({})

    useEffect(() => {
        for (const p of players) {
            if (p.uid === player_id) return setPlayer(p)
        }
        history.push(path)
    }, [player])

    return (
        <>
            <FullFrame player={player} phase={phase} path={path} />
        </>
    )
}

const DialogModal = ({ name, modalOpen, onSubmit, onChange }) => {
    Modal.setAppElement('#root')
    Modal.defaultStyles.overlay.backgroundColor = 'rgba(0,0,0,0.5)'
    return (
        <Modal
            isOpen={modalOpen}
            style={{
                content: {
                    backgroundColor: '#2d2d2d',
                    border: 'none',
                    top: '50%',
                    left: '50%',
                    paddingTop: '70px',
                    bottom: '10%',
                    right: '5%',
                    transform: 'translate(-50%, -50%)',
                },
            }}
        >
            <div className="container col-6">
                <h2 className="text-center">Join the Room</h2>
                <input
                    placeholder="Name"
                    className="splash-input form-control"
                    type="text"
                    value={name}
                    onChange={(e) => onChange(e)}
                    required
                />
                <button
                    className="splash-input form-control btn"
                    onClick={onSubmit}
                >
                    Spectate
                </button>
            </div>
        </Modal>
    )
}
export default Game
