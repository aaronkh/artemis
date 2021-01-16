import './App.css'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import Game from './pages/game'
import Splash from './pages/splash'

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/game">
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
