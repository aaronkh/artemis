const Template = require("./Template");

const html = `
<div id="main">
    <div id="waiting">
        <h1 id="please-wait"> Please wait... </h1>
        <p> 
            The game will start as soon as everyone's ready.
        <p>
        <div class="button">Ready</div>
        <p> 
        Editing as <b>{{name}}</b>. Not you? 
        <a id="sign-out">Sign out.</a> 
        </p>
    </div>
    <div id="game" class="invisible">
        <h1 id="time">15:00 remaining</h1>
        <p>Try to copy the site below <b>without</b> running your code.</p>
    </div>
    </div>
    <div id="content"></div>
`
const css = `
    * {
    }
    code {
        font-size: 1.2rem
    }
    .body,
    html {
        background: black;
        color: white;
        font-family: 'Poppins', sans-serif;
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        min-width: 100px;
    }

    #main {
        margin: 0.5rem;
        margin-left: 1.5rem;
        margin-right: 1.5rem;
    }

    a {
        color: inherit;
        text-decoration: underline;
        cursor: pointer;
    }

    .invisible {
        display: none;
    }

    .button {
        background: #49b738;
        text-align: center;
        margin-top: 6px;
        cursor: pointer;
        padding: 1rem;
        margin-bottom: 4px;
        width: 200px
    }

    .button-red {
        background: #dc004e;
    }

    #content {
        /* reset body styles */
        background: white;
        color: black;
        font-family: serif;
        margin: 0;
        padding: 0;
    }
`
const js = `
let isReady = false
const rdyButton = document.querySelector('.button')
const content = document.querySelector('#content')

document.getElementById('sign-out').addEventListener('click', () => vscode.postMessage({type: 'sign-out'}))

rdyButton.addEventListener('click', async () => {
    if(!isReady) { // Send ready signal
        vscode.postMessage({type: 'ready'})
        rdyButton.classList.add('button-red')
        rdyButton.innerText = 'Unready'
    } else { // Send unready signal
        vscode.postMessage({type: 'unready'})
        rdyButton.classList.remove('button-red')
        rdyButton.innerText = 'Ready'
    }
    isReady = !isReady
})

window.addEventListener('message', ({data}) => {
    const m = data
    if(m.type === 'time') {
        updateTimer(m.time)
    }
})
window.addEventListener('message', m => {
    if(m.type === 'content') loadContent(m.content)
})

function loadContent(c) {
    content.innerHTML = c
}

function updateTimer(time) {
    // Send reminders
    const reminderTimes = [10, 30, 60, 120, 5 * 60, 10 * 60]
    if(reminderTimes.includes(time))
        vscode.postMessage({
            type: 'time-reminder',
            time
        })

    // Update HTML
    const s = time%60
    const m = Math.floor(time/60)
    let t = m+":"
    if(s===0) t += '00'
    else if(s<10) t+='0'+s
    else t+=s
    document.getElementById('time').innerText = t + ' remaining'

    console.log('t', time)
    document.querySelector('#game').classList.remove('invisible')
    document.querySelector('#waiting').classList.add('invisible')
}
`

const Game = new Template(html, css, js)

module.exports = Game