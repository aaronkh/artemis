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

    const onSubmit = async () => {
        if (!name) return toast.error('Name is empty!')
        if (!game) return toast.error('Game code is empty!')
        try {
            const res = await fetch(`/game/${game}/exists`)
            if (res.status >= 400) throw new Error('Something went wrong...')

            const data = await res.json()
            if (!data.success) return toast.error('Game does not exist!')
            toast.success('Game exists')
        } catch (e) {
            console.error(e)
            return toast.error('Something went wrong...')
        }
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
