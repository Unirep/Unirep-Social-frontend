import { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import UserContext from '../../context/User'
// import QueueContext from '../../context/Queue'

const ProgressBar = () => {
    const userContext = useContext(UserContext)
    // const queueContext = useContext(QueueContext)
    return (
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
            {/* {queueContext.operations.map((op, i) => <div key={i} onClick={() => queueContext.removeOp(op)}>{op.type}</div>)} */}
        </div>
    )
}

export default observer(ProgressBar)
