import './App.css'
import { BrowserRouter as Router, Switch, Link, Route } from 'react-router-dom'

import Game from './pages/game'
import Splash from './pages/splash/splash'

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light navbar-transparent">
            <Link to="/" className="navbar-brand">
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
                        <Link className="nav-link" to="/">
                            Download
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

function App() {
    return (
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
    )
}

export default App
