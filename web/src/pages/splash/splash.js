import { useEffect, useState } from 'react'
import socket from '../../lib/socket'

function Splash() {
    const [name, setName] = useState('')
    const [game, setGame] = useState('')
    const [err, setErr] = useState('')

    useEffect(() => {
        socket.on('connect', () => {
            console.log('yay')
        })
        socket.on('error', (error) => {
            setErr(error.error)
        })

        return function cleanup() {
            socket.off('connect')
            socket.off('error')
        }
    })

    const onSubmit = () => {
        socket.emit('spectate', {
            id: game,
        })
    }

    return (
        <div
            className="container"
            style={{
                height: '100%',
            }}
        >
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                <h1
                    className="text-center"
                    style={{
                        marginBottom: '40px',
                    }}
                >
                    Coding in the Dark
                </h1>

                <div className="offset-3 col-6">
                    {err && (
                        <div
                            className="alert alert-danger alert-dismissable fade show"
                            role="alert"
                        >
                            {err}
                            <button
                                type="button"
                                className="close"
                                data-dismiss="alert"
                                aria-label="Close"
                                onClick={() => setErr('')}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    )}

                    <input
                        placeholder="Name"
                        className="splash-input form-control"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        placeholder="Game Code"
                        className="splash-input form-control"
                        type="text"
                        value={game}
                        onChange={(e) => setGame(e.target.value)}
                        required
                    />
                    <button
                        className="splash-input form-control btn"
                        onClick={onSubmit}
                    >
                        Spectate
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Splash
