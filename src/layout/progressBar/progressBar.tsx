import { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { EXPLORER_URL } from '../../config'

import UserContext from '../../context/User'
import QueueContext, { LoadingState, ActionType } from '../../context/Queue'

const ProgressBar = () => {
    const userContext = useContext(UserContext)
    const queueContext = useContext(QueueContext)
    const history = useHistory()

    const [isListOpen, setIsListOpen] = useState<boolean>(false)

    return (
        <div className="progress-block">
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
                            <p>
                                <img
                                    src={require(`../../../public/images/${
                                        h.isSuccess
                                            ? 'check-circle'
                                            : 'emotion-sad-fill'
                                    }.svg`)}
                                />
                                {h.type}
                            </p>
                            {h.isSuccess ? (
                                <a
                                    className="etherscan"
                                    target="_blank"
                                    href={`${EXPLORER_URL}/tx/${h.data}`}
                                >
                                    <span>Etherscan</span>
                                    <img
                                        src={require('../../../public/images/etherscan-white.svg')}
                                    />
                                </a>
                            ) : h.type === ActionType.Post ? (
                                <a
                                    className="etherscan"
                                    onClick={() => {
                                        history.push('/new', {
                                            isConfirmed: true,
                                        })
                                    }}
                                >
                                    see my post
                                </a>
                            ) : h.type === ActionType.Comment ||
                              h.type === ActionType.Vote ? (
                                <a
                                    className="etherscan"
                                    href={`/post/${h.data}`} // if vote on comments, now is not going to the right page
                                >
                                    go to post
                                </a>
                            ) : null}
                        </div>
                    ))}
                    {queueContext.activeOp ? (
                        <div className="list-item">
                            <p>
                                <img
                                    src={require(`../../../public/images/progress-bg.png`)}
                                />
                                {queueContext.activeOp.type}
                            </p>
                            <p>Loading...</p>
                        </div>
                    ) : null}

                    {queueContext.operations.map((op, i) => (
                        <div className="list-item" key={i}>
                            <p>
                                <img
                                    src={require(`../../../public/images/progress-bg.png`)}
                                />
                                {op.type}
                            </p>
                            <p className="cancel">Cancel</p>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

export default observer(ProgressBar)
