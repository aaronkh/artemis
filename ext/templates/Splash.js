const Template = require("./Template")
const html = `        
<div class="main"> 
<h1> Coding in the Dark </h1>
<div class="switcher">
    <div class="switcher-item selected" id="create">Create game</div>
    <div class="switcher-item" id="join">Join game</div>
</div>
<input type="text" placeholder="Name" id="name"/>
<input type="text" placeholder="Game Code" id="code" class="invisible"/>
<div id="error" class="invisible">Name is required.</div>
<div class="button" id="create-btn">Create</div>
<div class="button invisible" id="join-btn">Join</div> 
</div>`

const styles = `
* {
    transition: 0.2s;
    opacity: 1;
}

#body, html {
    background: black;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Poppins', sans-serif;
    min-width: 100px;
}
.main {
    display: flex;
    flex-direction: column;
    align-items: stretch;
}
.button {
    background: #49b738;
    text-align: center;
    margin-top: 6px;
    cursor: pointer;
    padding: 1rem;
    margin-bottom: 4px;
}
input {
    border: 0;
    text-align: center;
    padding: 1rem;
    margin-top: 6px;
    margin-bottom: 6px;
    font-family: inherit;
}

#error {
    margin-bottom: 4px;
    margin-top: 4px;
    color: #dc004e
}

.switcher {
    display: flex;
    margin-bottom: 1rem;
    margin-top: 1rem;
}

.switcher-item {
    flex-grow: 1;
    text-align: center;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    padding-bottom: 12px;
}

.selected {
    border-bottom: 2px solid #49b738;
}

.invisible {
    display: none;
    opacity: 0;
}
`

const script = `
const $ = (e) => document.querySelector(e)
let currState = 'create'

const createBtn = $('#create-btn')
const joinBtn = $('#join-btn')

const create = $('#create')
const join = $('#join')

const error = $('#error')
const name = $('#name')
const code = $('#code')

create.addEventListener('click', () => {
    if(currState !== 'create') {
        join.classList.toggle('selected')
        create.classList.toggle('selected')
        joinBtn.classList.toggle('invisible')
        createBtn.classList.toggle('invisible')
        error.classList.add('invisible')
        code.classList.add('invisible')
        currState = 'create'
    }
})
join.addEventListener('click', () => {
    if(currState !== 'join') {
        join.classList.toggle('selected')
        create.classList.toggle('selected')
        joinBtn.classList.toggle('invisible')
        createBtn.classList.toggle('invisible')
        error.classList.add('invisible')
        code.classList.remove('invisible')
        currState = 'join'
    }
})

createBtn.addEventListener('click', async () => {
    error.classList.add('invisible')
    // Handle errors 
    if(!name.value.trim()) {
        error.innerText = "Name is required."
        error.classList.remove('invisible')
        return
    }
    vscode.postMessage({
        type: 'create',
        name: name.value.trim()
    })
})

joinBtn.addEventListener('click', async () => {
    error.classList.add('invisible')
    // Handle errors 
    if(!name.value.trim()) {
        error.innerText = "Name is required."
        error.classList.remove('invisible')
        return
    }
    if(!code.value.trim()) {
        error.innerText = "Game code is required."
        error.classList.remove('invisible')
        return
    }
    vscode.postMessage({
        type: 'join',
        id: code.value.trim(),
        name: name.value.trim()
    })
})
`
const Splash = new Template(html, styles, `(() => {${script}})()`)

module.exports = Splash
