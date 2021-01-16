import "../../../App.css"

function chat(){
    return<>
        <div className = "chat">
            <h5 className = "chat-header" >Chat</h5>
            <ul className="chat-messages">
                <li className="incoming-message"><div className="chat-names">Devin</div><p>hi Aaron</p></li>
                <li className="incoming-message"><div className="chat-names">Devin</div><p>hi Aaron</p></li>
                <li className="incoming-message"><div className="chat-names">Devin</div><p>hi Aaron</p></li>
                <li className="incoming-message"><div className="chat-names">Devin</div><p>hi Aaron</p></li>
                <li className="outgoing-message"><div className="chat-names">Aaron</div><p>hi?</p></li>
            </ul>
            <form className="chat-form" action="">
                <input className="chat-input" placeholder="Send a message" autocomplete="off" />
            </form>
        </div>
    </>
}
export default chat