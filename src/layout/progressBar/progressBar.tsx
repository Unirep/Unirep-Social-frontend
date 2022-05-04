import { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import UserContext from '../../context/User'
import QueueContext, { LoadingState } from '../../context/Queue'

const ProgressBar = () => {
    const userContext = useContext(UserContext)
    const queueContext = useContext(QueueContext)

    return (
        <div className="progress-block">
            {queueContext.loadingState !== LoadingState.none ? (
                <div className="progress-bar-container">
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{
                                backgroundImage: `url(${require('../../../public/images/progress-bg.png')})`,
                                width: `${userContext.syncPercent}%`,
                            }}
                        />
                    </div>
                    <div className="progress-bar-text">
                        <img
                            src={require('../../../public/images/glasses-white.svg')}
                        />
                        {Math.floor(userContext.syncPercent)}%
                    </div>
                </div>
            ) : (
                <div className="progress-bar-container">Nothing's Pending.</div>
            )}
            {queueContext.loadingState === LoadingState.loading ? (
                <div className="progress-info">{queueContext.status.title}</div>
            ) : queueContext.loadingState === LoadingState.success ? (
                <div className="progress-info">
                    {queueContext.latestMessage}
                </div>
            ) : queueContext.loadingState === LoadingState.failed ? (
                <div className="progress-info">
                    {queueContext.latestMessage}
                </div>
            ) : null}
        </div>
    )
}

export default observer(ProgressBar)
