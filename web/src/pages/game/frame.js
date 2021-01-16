function Frame(props) {
    return (
        <div className="col-6">
            <div>
                <div className="website"></div>
                {props.player.winner && <div className="badge">Winner</div>}
            </div>
            <p className="frame-name">{props.player.name}</p>
        </div>
    )
}

function FullFrame(props) {
    return (
        <div>
            <div>
                <div className="website"></div>
                {props.player.winner && <div className="badge">Winner</div>}
            </div>
            <p className="frame-name">{props.player.name}</p>
        </div>
    )
}

export default Frame
export { FullFrame }
