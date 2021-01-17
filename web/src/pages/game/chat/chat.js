import { useState } from 'react'
import socket from '../../../lib/socket'
function Chat(){
    const [input, setInput] = useState('')

    const handleKeyPress = (event) => {
        
        if(event.key === 'Enter'){
            if (input) {
                let msg_data = {id: "id", name: "name", msg: input}
                socket.emit('chat message', msg_data);
                console.log(`Sending Message: ${msg_data.msg}`)
                let messages = document.getElementById('messages');
                if(messages){
                    let item = document.createElement('li');
                    let name = document.createElement('div');
                    let content = document.createElement('p');
                    content.textContent = msg_data.msg;
                    item.className="outgoing-message";
                    name.className="chat-names";
                    name.textContent=msg_data.name;
                    item.appendChild(name);
                    item.appendChild(content);
                    messages.appendChild(item);
                    window.scrollTo(0, document.body.scrollHeight);
                }
            
                setInput('');
            }
        }
    }

   

    socket.on('chat message', function(msg_data) {
        let messages = document.getElementById('messages');
        if(messages){
            let item = document.createElement('li');
            let name = document.createElement('div');
            let content = document.createElement('p');
            content.textContent = msg_data.msg;
            item.className="incoming-message";
            name.className="chat-names";
            name.textContent=msg_data.name;
            item.appendChild(name);
            item.appendChild(content);
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
        }
    });
    return(
        <div className = "chat">
            <h5 className = "chat-header" >Chat</h5>
            <ul className="chat-messages" id="messages">
                
            </ul>
            <div className="chat-form">
                <input className="chat-input" type="field" value={input} onChange={(e) => {setInput(e.target.value);}} placeholder="Send a message" onKeyPress={handleKeyPress} autocomplete="off"/>
            </div>
        </div>
    )
}
export default Chat