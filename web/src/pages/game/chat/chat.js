import "../../../App.css"

function chat(){
    return<>
        <div className = "chat">
            <h4 className = "chat-header" >Chat</h4>
            <ul className="chat-messages"></ul>
            <form className="chat-form" action="">
                <input className="chat-input" placeholder="Send a message" autocomplete="off" />
            </form>
        </div>
    </>
}
export default chat