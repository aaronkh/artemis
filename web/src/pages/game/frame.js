function Frame({ code, player }) {
    return (
        <div className="col-6">
            <div className="small-frame-container">
                <iframe
                    srcdoc={code}
                    title={player.name}
                    className="iframe small-frame"
                    width={1000}
                    height={600}
                />
                {player.winner && <div className="badge">Winner</div>}
            </div>
            <p className="frame-name">{player.name}</p>
        </div>
    )
}

function FullFrame({ code, player }) {
    return (
        <>
            <div style={{ height: '100%' }}>
                <iframe
                    srcdoc={code}
                    title={player.name}
                    className="iframe full-frame"
                />
                {player.winner && <div className="badge">Winner</div>}
                <p className="frame-name">{player.name}</p>
            </div>
        </>
    )
}

export default Frame
export { FullFrame }
