import { useEffect, useState } from 'react'
import socket from '../../../lib/socket'
import ReactScrollableFeed from 'react-scrollable-feed'

import { useStore } from 'react-redux'

import { Picker } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'

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
    const [openEmoji, setOpenEmoji] = useState(false)
    const [messages, setMessages] = useState([])

    const store = useStore()

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
                    name: store.getState().game.name,
                    message: input,
                }
                // send message
                socket.emit('chat message', message)

                message.outgoing = true
                chatMessages.push(message)
                setMessages([...chatMessages])
                setInput('')
                setOpenEmoji(false)
            }
        }
    }

    return (
        <div className="chat">
            <h5 className="chat-header">Chat</h5>
            <ul className="chat-messages">
                <ReactScrollableFeed>
                    {messages.map((message) => (
                        <Message message={message} />
                    ))}
                </ReactScrollableFeed>
            </ul>
            {openEmoji && (
                <div className="emoji-picker-container">
                    <Picker
                        style={{
                            position: 'absolute',
                            bottom: '50px',
                            right: '0px',
                        }}
                        onSelect={(emoji) => {
                            setInput(input + emoji.native)
                        }}
                        theme="dark"
                    />
                </div>
            )}
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
                <div
                    className="emoji-picker-button"
                    onClick={() => {
                        setOpenEmoji(!openEmoji)
                    }}
                >
                    🍆
                </div>
            </div>
        </div>
    )
}
export default Chat
