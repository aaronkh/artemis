import { Link } from 'react-router-dom'

const PHASE = {
    WAITING: 'WAITING',
    PLAYING: 'PLAYING',
    VOTING: 'VOTING',
    FINISHED: 'FINISHED',
}

function Badge({ phase, player, fullFrame, voted, onVote }) {
    switch (phase) {
        case PHASE.WAITING:
            if (fullFrame) return <></>
            return (
                <div
                    className={`badge-button ${
                        fullFrame === true
                            ? 'badge-full-frame'
                            : 'badge-small-frame'
                    } ${
                        player.ready === true ? 'badge-ready' : 'badge-unready'
                    }`}
                />
            )
        case PHASE.PLAYING:
            return <></>
        case PHASE.VOTING:
            if (voted) return <></>
            return (
                <div
                    className={`badge-button badge-voting ${
                        fullFrame === true
                            ? 'badge-full-frame'
                            : 'badge-small-frame'
                    }`}
                    onClick={() => {
                        onVote(player)
                    }}
                >
                    Vote!
                </div>
            )
        case PHASE.FINISHED:
            return (
                <div
                    className={`badge-button badge-placement ${
                        fullFrame === true
                            ? 'badge-full-frame'
                            : 'badge-small-frame'
                    }`}
                >
                    {player.votes}
                </div>
            )
        default:
            break
    }
}

function Frame({ player = {}, phase, to, voted, onVote }) {
    return (
        <div className="col-6" style={{ marginBottom: '25px' }}>
            <div className="small-frame-container">
                <iframe
                    srcDoc={player.code.replace(
                        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                        ''
                    )}
                    title={player.name}
                    className="iframe small-frame"
                    width={1000}
                    height={600}
                />
                <Badge
                    phase={phase}
                    player={player}
                    voted={voted}
                    onVote={(p) => onVote(p)}
                />
            </div>
            <p className="frame-name" style={{ marginTop: '10px' }}>
                <Link to={to}>{player.name}</Link>
            </p>
        </div>
    )
}

function FullFrame({ player = {}, phase, path }) {
    return (
        <>
            <h5 className="frame-name">
                Viewing {player.name} | <Link to={path}>Back</Link>
            </h5>
            <div
                style={{
                    height: '100%',
                }}
            >
                <div style={{ height: '100%' }}>
                    <iframe
                        srcDoc={
                            player.code
                                ? player.code.replace(
                                      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                                      ''
                                  )
                                : ''
                        }
                        title={player.name}
                        className="iframe full-frame"
                    />
                    <Badge phase={phase} player={player} fullFrame={true} />
                </div>
            </div>
        </>
    )
}

export default Frame
export { FullFrame }
