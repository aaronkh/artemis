const vscode = require('vscode')
const path = require('path')
const Renderer = require('./templates/Renderer')

const PAGES = {
    splash: require('./templates/End'),
    game: require('./templates/Game'),
    end: require('./templates/End')
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
        panel.webview.onDidReceiveMessage(m => this._onMessage(m))
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

    _onMessage(m) {
        if (!m || !m.type) console.error('Message missing type', m)
        console.log('Message received', m)
        let uri = null
        switch (m.type) {
            case 'play-again':
                this.player = {
                    name: '',
                    id: ''
                }
                this._loadHTML(PAGES['splash'])
                break
            case 'join':
                // TODO: check with server to get valid join code
                // Expects a player id and game id from server
                // Go next
                this.player = {
                    name: m.name,
                    id: 'testid-123',
                }
                this.gameId = 'testgame-123'
                this._loadHTML(
                    PAGES['game'],
                    this.player
                )
                break
            case 'ready':
                // TODO: send ready signal to server
                break
            case 'unready':
                break
            case 'end':
                // Redirect to end screen
                break
            case 'sign-out':
                this.player = {
                    name: '',
                    id: ''
                }
                // TODO: also clear from server
                this._loadHTML(PAGES['splash'])
                break
            case 'time-reminder':
                if (m.time > 60)
                    vscode.window.showInformationMessage(`${Math.floor(m.time / 60)} minutes re.`)
                else
                    vscode.window.showInformationMessage(`${m.time} seconds remaining.`)
                break
            case 'game-start':
                // Open new editor with template code
                uri = path.join(__dirname, 'skeleton.html')
                // TODO: get ending time from server, send game start signal
                uri = vscode.Uri.file(uri)
                vscode.workspace.openTextDocument(uri).then(doc => {
                    vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside })
                })
                    .then(editor => {
                        this._updateTime(60 * 15, editor)
                    })
                    .catch(e => console.error('error', e))
                break
        }
    }

    _updateTime(startTime, editor) {
        this._sendMessage({
            type: 'time',
            time: startTime
        })
        // TODO: send this to server
        const text = editor.document.getText()

        if (startTime < 500) return
        window.setTimeout(() => {
            this._updateTime(startTime - 1000)
        }, 1000);
    }

    _sendMessage(d) {
        // JS message passing: https://code.visualstudio.com/api/extension-guides/webview#scripts-and-message-passing
        if (!this.panel) {
            return
        }
        this.panel.webview.postMessage(d)
    }

    _loadHTML(page, data) {
        if (!this.panel) return
        // Render each part of data then pass into 
        // message event
        const payload = page.render(data)
        this._sendMessage({ type: 'render', ...payload })
    }
}

module.exports = Provider