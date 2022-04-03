import { useState, useContext, useEffect } from 'react'
import { HashLink as Link } from 'react-router-hash-link'
import './loadingWidget.scss'
import QueueContext, { LoadingState } from '../../context/Queue'
import { observer } from 'mobx-react-lite'

const LoadingWidget = () => {
    const [isFlip, setFlip] = useState<boolean>(false)
    const [goto, setGoto] = useState<string>('')
    const queue = useContext(QueueContext)

    useEffect(() => {
        const timer = setTimeout(() => {
            setFlip(!isFlip)
        }, 500)

        return () => clearTimeout(timer)
    }, [isFlip])

    const gotoEtherscan = (event: any) => {
        event.stopPropagation()
        queue.resetLoading()
    }
    if (queue.loadingState === LoadingState.none)
        return (
            <div
                className="loading-widget"
                onClick={() => queue.resetLoading()}
            />
        )
    if (queue.loadingState === LoadingState.loading)
        return (
            <div
                className="loading-widget"
                onClick={() => queue.resetLoading()}
            >
                <div className="loading-block">
                    <img
                        src={require('../../../public/images/loader.svg')}
                        style={{ transform: `scaleX(${isFlip ? '-1' : '1'})` }}
                    />
                    <span>Submitting your content...</span>
                    <div className="info-row">
                        Please wait 'til this transaction complete for creating
                        post, comment, boost, or squash. This is the life of
                        blockchain :P{' '}
                    </div>
                </div>
            </div>
        )
    if (queue.loadingState === LoadingState.success)
        return (
            <div
                className="loading-widget"
                onClick={() => queue.resetLoading()}
            >
                <div className="loading-block">
                    <img
                        src={require('../../../public/images/checkmark.svg')}
                    />
                    <span>{queue.latestMessage}</span>
                </div>
            </div>
        )

    if (queue.loadingState === LoadingState.failed)
        return (
            <div
                className="loading-widget"
                onClick={() => queue.resetLoading()}
            >
                <div className="loading-block failed">
                    <img
                        src={require('../../../public/images/close-red.svg')}
                    />
                    <span>Posting to blockchain failed.</span>
                    <div className="info-row">
                        <Link className="link failed" to={goto}>
                            See my content
                        </Link>
                    </div>
                </div>
            </div>
        )

    return (
        <div className="loading-widget" onClick={() => queue.resetLoading()}>
            <div />
        </div>
    )
}

export default observer(LoadingWidget)
