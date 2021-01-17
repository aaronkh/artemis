const Template = require('./Template')
// This game has ended!
// Click to vote / see results
const html = `
<div id="main">
    <div id="game" class="">
        <h1 id="time">Time's up!</h1>
        <p>This game of Coding in the Dark has ended. Click <a href="" id="results">here</a> to cast your votes and see your results.</p>
        <div class="button" id="play-again">Play again</div>
    </div>
</div>
`
const style = `
    .body,
    html {
        background: black;
        color: white;
        display: flex;
        flex-direction: column;
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
    }

    .button {
        background: #49b738;
        text-align: center;
        margin-top: 1.5rem;
        cursor: pointer;
        padding: 1rem;
        margin-bottom: 4px;
        max-width: 200px;

    }
`
const js = `
    document.querySelector('#results').addEventListener('click', () => {
        vscode.postMessage({type: 'open-spectator'})
    })
    document.querySelector('#play-again').addEventListener('click', () => {
        vscode.postMessage({type: 'play-again'})
    })
`

module.exports = new Template(html, style, js)