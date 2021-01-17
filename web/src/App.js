import './App.css'
import { BrowserRouter as Router, Switch, Link, Route } from 'react-router-dom'

import { Provider } from 'react-redux'
import store from './redux'

import Game from './pages/game'
import Splash from './pages/splash/splash'

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light navbar-transparent">
            <Link to="/" className="navbar-brand">
                <img
                    src="/logo.png"
                    width="30"
                    height="30"
                    alt="Logo"
                    style={{ marginRight: '15px' }}
                />
                Coding in the Dark
            </Link>
            <button
                className="navbar-toggler"
                type="button"
                dataToggle="collapse"
                dataTarget="#navbarSupportedContent"
                ariaControls="navbarSupportedContent"
                ariaExpanded="false"
                ariaLabel="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
            >
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item active">
                        <a
                            className="nav-link"
                            href="https://marketplace.visualstudio.com/items?itemName=aaronkh.coding-in-the-dark"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Download
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

function App() {
    return (
        <Provider store={store}>
            <Router>
                <Navbar />
                <Switch>
                    <Route path="/game/:id">
                        <Game />
                    </Route>
                    <Route exact path="/">
                        <Splash />
                    </Route>
                </Switch>
            </Router>
        </Provider>
    )
}

export default App
