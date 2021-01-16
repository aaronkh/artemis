import "./App.css"

function chat(){
    return<>
        <div classname = "chat">
            <div className = "header"><h2>Chat</h2></div>
            <div className = "input">
            <ul id="messages"></ul>
            <form id="form" action="">
                <input id="input" autocomplete="off" />
            </form>
            </div>
        </div>
    </>
}

export default chat