const uuid = require('uuid').v4
const vscode = require('vscode')
const Game = require('./templates/Game')
const Splash = require('./templates/Splash')
const Renderer = require('./templates/Renderer')

const PAGES = {
    splash: Splash,
    game: Game,
    // end: End
}

class Provider {
    constructor() {
        this.windowActive = false
        this.gameId = ''
        this.player = {
            name: 'Aaron',
            id: ''
        }
    }

    activateWindows(window) {
        if (this.windowActive) {
            return
        }

        const panel = window.createWebviewPanel(
            'coding-in-the-dark',
            'Coding in the Dark',
            vscode.ViewColumn.Beside,
            { enableScripts: true })
        this.windowActive = true
        this.panel = panel

        panel.webview.html = Renderer
        if (this.gameId) {
            // Game has already started  
            this._loadHTML(
                PAGES['game'],
                player)
        } else {
            // Load landing page
            this._loadHTML(
                PAGES['splash'],
            )
        }

        // Remember to clear listeners!
        panel.onDidDispose(() => this.dispose())

    }

    dispose() {
        this.windowActive = false
        this.panel = null
    }

    _sendMessage(d) {
        // JS message passing: https://code.visualstudio.com/api/extension-guides/webview#scripts-and-message-passing
        if (!this.panel) {
            return
        }
        console.log(d)
        this.panel.webview.postMessage(d)
    }

    _loadHTML(page, data) {
        if (!this.panel) return
        // Render each part of data then pass into 
        // message event
        this._sendMessage({type: 'render', ...page.render({data})})
    }
}

module.exports = Provider