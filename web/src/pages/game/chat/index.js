import { useEffect, useState } from 'react'
import socket from '../../../lib/socket'

function Message({ message }) {
    return (
        <li
            className={
                message.outgoing ? 'outgoing-message' : 'incoming-message'
            }
        >
            <div className="chat-names">{message.name}</div>
            <p>{message.message}</p>
        </li>
    )
}

function Chat({ id }) {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([])

    useEffect(() => {
        socket.on('chat message', function (message) {
            let chatMessages = messages
            chatMessages.push(message)
            setMessages([...chatMessages])
        })
    }, [])

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            if (input) {
                let chatMessages = messages

                let message = {
                    id: id,
                    name: 'name',
                    message: input,
                }
                // send message
                socket.emit('chat message', message)

                message.outgoing = true
                chatMessages.push(message)
                setMessages([...chatMessages])
                setInput('')
            }
        }
    }

    return (
        <div className="chat">
            <h5 className="chat-header">Chat</h5>
            <ul className="chat-messages">
                {messages.map((message) => (
                    <Message message={message} />
                ))}
            </ul>
            <div className="chat-form">
                <input
                    className="chat-input"
                    type="field"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value)
                    }}
                    placeholder="Send a message"
                    onKeyPress={handleKeyPress}
                    autocomplete="off"
                />
            </div>
        </div>
    )
}
export default Chat
