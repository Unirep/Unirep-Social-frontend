import { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import UserContext from '../../context/User'

const ProgressBar = () => {
    const userContext = useContext(UserContext)
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
        </div>
    )
}

export default observer(ProgressBar)
