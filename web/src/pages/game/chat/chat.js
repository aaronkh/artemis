import "../../../App.css"

function chat(){
    return<>
        <div classname = "chat">
            <h4 className = "chat-header" >Chat</h4>
            <div className = "chat-input">
                <ul id="chat-messages"></ul>
                <form id="chat-form" action="">
                    <input id="chat-input" autocomplete="off" />
                </form>
            </div>
        </div>
    </>
}
export default chat