const vscode = require('vscode')
const path = require('path')
const Game = require('./templates/Game')
const Splash = require('./templates/Splash')

const PAGES = {
    splash: Splash,
    game: Game
}

class Provider {
    constructor(path) {
        this.windowActive = false
        this.path = path
        this.gameId = ''
    }

    activateWindows(window) {
        try {
            if (this.windowActive) {
                return
            }

            const panel = window.createWebviewPanel(
                'coding-in-the-dark',
                'Coding in the Dark',
                vscode.ViewColumn.Beside,
                { enableScripts: true })
            if (this.gameId) {
                // Game has already started   
            } else {
                // Load landing page
                this._loadHTML(
                    PAGES['splash'],
                    panel
                )
            }

            // Remember to clear listeners!
            panel.onDidDispose(() => this.dispose())

            this.windowActive = true
            this.panel = panel
        } catch (e) { console.error(e) }
    }

    dispose() {
        this.windowActive = false
        this.panel = null
    }

    _sendMessage(message) {
        // JS message passing: https://code.visualstudio.com/api/extension-guides/webview#scripts-and-message-passing
        console.log(message)
    }

    _loadHTML(page, panel) {
        if (!panel) return
        const html = page.render()
        panel.webview.html = html
    }
}

module.exports = Provider