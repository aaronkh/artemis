import './App.css'

function Splash() {
    return <>
    <div className = "smallTitle">
        <h6>Coding in the Dark</h6>
    </div>
    <div className = "splash">
        <h1 className = "header">Coding in the Dark</h1>

        <p><input className = "input" type="text" id="name" name="name" value = "Name" required></input></p>
        <p><input className = "input" type="text" id="codeid" name="name" value = "Code ID" required></input></p>
        <button className = "button">Spectate</button>
    </div>

    </>
}


export default Splash
