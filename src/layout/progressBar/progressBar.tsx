import { useContext, useState } from 'react'
import { observer } from 'mobx-react-lite'

import UserContext from '../../context/User'
import QueueContext, { LoadingState } from '../../context/Queue'

const ProgressBar = () => {
    const userContext = useContext(UserContext)
    const queueContext = useContext(QueueContext)

    const [isListOpen, setIsListOpen] = useState<boolean>(false)

    return (
        <div
            className="progress-block"
            onClick={() => setIsListOpen(!isListOpen)}
        >
            {queueContext.loadingState === LoadingState.loading ? (
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
            ) : null}
            {queueContext.loadingState === LoadingState.loading ? (
                <div
                    className="progress-info"
                    onClick={() => setIsListOpen(!isListOpen)}
                >
                    <div>
                        <h4>{queueContext.status.title}</h4>
                        <p>{queueContext.status.details}</p>
                    </div>
                    <h4>
                        Detail{' '}
                        <img
                            src={require(`../../../public/images/arrow-${
                                isListOpen ? 'up' : 'down'
                            }-s-fill.svg`)}
                        />
                    </h4>
                </div>
            ) : (
                <div
                    className="progress-info"
                    onClick={() => setIsListOpen(!isListOpen)}
                >
                    <h4>All done.</h4>
                    <h4>
                        Detail{' '}
                        <img
                            src={require(`../../../public/images/arrow-${
                                isListOpen ? 'up' : 'down'
                            }-s-fill.svg`)}
                        />
                    </h4>
                </div>
            )}
            {isListOpen ? (
                <div className="progress-list">
                    {queueContext.histories.map((h, i) => (
                        <div className="list-item" key={i}>
                            {h.type}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

export default observer(ProgressBar)
