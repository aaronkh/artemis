const vscode = require('vscode')
const fetch = require('node-fetch')
const path = require('path')
const io = require('socket.io-client');
const Renderer = require('./templates/Renderer');

const PAGES = {
    splash: require('./templates/Splash'),
    game: require('./templates/Game'),
    end: require('./templates/End')
}

function url() {
    const cfg = vscode.workspace.getConfiguration('coding-in-the-dark')
    return cfg.URL
}

class Provider {
    constructor() {
        this._init()
    }

    _init() {
        console.log(this.int)

        if (this.int) { 
            clearInterval(this.int) 
        }
        this.windowActive = false
        this.gameId = ''
        this.player = {
            name: '',
            id: ''
        }
        this.waitingJoin = false
        this.panel = null
        this.int = -1
        if (this.socket) this.socket.close()
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
        panel.webview.onDidReceiveMessage(m => this._onMessage(m).catch(({ e, err }) => this._error(e + (console.error(err) || ''))))
        // Load landing page
        this.waitingJoin = false
        this._loadHTML(PAGES['splash'])

        // Remember to clear listeners!
        panel.onDidDispose(() => { console.log('etf'); this._init() })
    }

    async _onMessage(m) {
        if (!m || !m.type) console.error('Message missing type', m)
        console.log('Message received', m)
        let uri = null
        let res = null
        let js = null
        switch (m.type) {
            case 'play-again':
                if (this.socket) this.socket.close()
                this.player = {
                    name: '',
                    id: ''
                }
                this.waitingJoin = false
                this._loadHTML(PAGES['splash'])
                break
            case 'join':
                try {
                    res = await fetch(url() + `/game/${m.id}/exists`)
                    if ((await res.json()).success) {
                        this.gameId = m.id
                        this.player.name = m.name
                        const i = io(url(), { rejectUnauthorized: false })
                        this._initSocket(i)
                        this._loadHTML(
                            PAGES['game'],
                            { ...this.player, gameId: this.gameId }
                        )
                    } else {
                        throw Error('something wrong w join')
                    }
                } catch (e) {
                    this._error(e, 'Failed to join game.')
                }
                break
            case 'create':
                try {
                    res = await fetch(url() + `/game`, {
                        method: 'POST'
                    })
                    js = await res.json()

                    if (js.game) {
                        this.gameId = js.game
                        this.player.name = m.name
                        const i = io(url(), { rejectUnauthorized: false })
                        this._initSocket(i)
                        this._loadHTML(
                            PAGES['game'],
                            { ...this.player, gameId: this.gameId }
                        )
                    } else {
                        throw Error('something wrong w create')
                    }
                } catch (e) {
                    this._error(e, 'Failed to start a new game.')
                }
                break
            case 'ready':
                console.log(this.gameId)
                this._sendSocket('ready', {
                    id: this.gameId,
                    uid: this.player.id,
                })
                break
            case 'unready':
                this._sendSocket('unready', {
                    id: this.gameId,
                    uid: this.player.id
                })
                break
            case 'sign-out':
                this.player = {
                    name: '',
                    id: ''
                }
                this.waitingJoin = false
                this._loadHTML(PAGES['splash'])
                fetch(url() + `/game/${this.gameId}/${this.player.id}/sign-out`)
                if (this.socket) {
                    this.socket.close()
                }
                break
            case 'time-reminder':
                if (m.time > 60)
                    vscode.window.showInformationMessage(`${Math.floor(m.time / 60)} minutes remaining.`)
                else
                    vscode.window.showInformationMessage(`${m.time} seconds remaining.`)
                break
            case 'open-spectator':
                uri = vscode.Uri.parse(url() + '/game/' + this.gameId)
                vscode.commands.executeCommand('vscode.open', uri)
                break
        }
    }

    _updateTime(startTime, editor) {
        if(this.int) clearInterval(this.int)

        const int = setInterval(() => {
            console.log('time', this.int)
            console.log(int)
            this._sendMessage({
                type: 'time',
                time: startTime / 1000
            })
            const code = editor.document.getText()
            this._sendSocket('code update', {
                id: this.gameId,
                uid: this.player.id,
                code
            })

            if (startTime < 500) {
                // Redirect to end screen 
                if (this.panel) {
                    this.player = {}
                    this._loadHTML(PAGES['end'])
                    if (this.sock) this.sock.close()
                }
                clearInterval(int)
                return
            }
            startTime -= 1000
        }, 1000)
        this.int = int
    }

    // Verbose err and compact (user-displayed) e
    _error(err, e) {
        vscode.window.showWarningMessage(e)
        return { err, e }
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
        const payload = page.render({ url: url(), ...data })
        console.log(payload)
        this._sendMessage({ type: 'render', ...payload })
    }

    _sendSocket(event, data) {
        if (!this.socket) return
        this.socket.emit(event, data)
    }

    _initSocket(sock) {
        if (this.socket) {
            this.socket.close()
            sock = null
        }
        sock.onAny((event, args) => {
            console.log(`got ${event} ${JSON.stringify(args)}`);
        });

        sock.on('disconnect', () => {
            this.socket = null
            this.player.id = ''
            console.log('disconnected')
            this._error(e, `Disconnected. Automatically trying to reconnect...`)
        })
        sock.on('connect', () => {
            this.socket = sock
            this.player.id = sock.id
            console.log('connected')
            if (!this.waitingJoin) {
                sock.emit('join', { id: this.gameId, name: this.player.name })
                this.waitingJoin = true
            }
        })
        sock.on('connect_error', (e) => {
            this._error(e, 'Couldn\'t join the game. Please try again later.')
            this.socket = null
            this.player.id = ''
            this._loadHTML(pages['splash'])
            this.waitingJoin = false
        })
        sock.on('game over', () => {
            // Not needed, will handle client-side
            this._loadHTML(PAGES['end'],)
            this.waitingJoin = false
            sock.close()
        })
        sock.on('error', ({ error }) => {
            // Redirect back to start screen  
            this._error('Error from server: ' + error, error)
            this._loadHTML(pages['splash'])
            this.waitingJoin = false
        })
        sock.on('ready', (data) => {
            if (!data.end_time) return
            // Open new editor with template code
            const start_time = Date.parse(data.start_time)
            const end_time = Date.parse(data.end_time)
            let uri = path.join(__dirname, 'skeleton.html')
            uri = vscode.Uri.file(uri)
            vscode.workspace.openTextDocument({
                language: 'html',
                content: require('./skeleton')()
            })
                .then(doc =>
                    vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside })
                )
                .then(editor => {
                    const seconds = (end_time - start_time)
                    this._updateTime(seconds, editor)
                })
                .catch(e => console.log('err', e))
        })
    }
}

module.exports = Provider