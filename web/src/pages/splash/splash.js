import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import socket from '../../lib/socket'

function Splash() {
    const [name, setName] = useState('')
    const [game, setGame] = useState('')

    useEffect(() => {
        socket.on('error', (error) => {
            toast.error(error.error)
        })

        return function cleanup() {
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
            <Toaster />
        </div>
    )
}

export default Splash
