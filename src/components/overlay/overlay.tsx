import { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import { WebContext } from '../../context/WebContext'
import UserContext from '../../context/User'
import './overlay.scss'


const Overlay = () => {
    const { setIsMenuOpen } = useContext(WebContext)
    const history = useHistory()
    const userContext = useContext(UserContext)

    const closeOverlay = () => {
        // if (!isLoading) {
        console.log('close over lay')
        setIsMenuOpen(false)
        // } else {
        //     console.log('something is loading, no close')
        // }
    }

    const gotoUserPage = () => {
        history.push(`/user`, { isConfirmed: true })
    }

    const signout = () => {
        userContext.logout()
        setIsMenuOpen(false)
        history.push('/')
    }

    return (
        <div className="overlay" onClick={closeOverlay}>
            <div className="blur-area"></div>
            <div className="black-area">
                <div className="close-info">
                    <img src={require('../../../public/images/close.svg')} />
                </div>
                <div className="fixed-info">
                    <a href="https://about.unirep.social/how-it-works">
                        How it work
                    </a>
                    <a href="https://about.unirep.social/how-it-works#faq">
                        FAQ
                    </a>
                    <a href="https://about.unirep.social">About</a>
                </div>
                {!userContext.userState ? (
                    <div className="dynamic-info">
                        <a href="/feedback">Send feedback</a>
                        <p onClick={gotoUserPage}>My stuff</p>
                        <p onClick={signout}>Sign out</p>
                    </div>
                ) : (
                    <div className="dynamic-info">
                        <a href="/feedback">Send feedback</a>
                        <a href="/login">Sign in</a>
                        <a href="/signup">Join</a>
                    </div>
                )}
            </div>
        </div>
    )
}

export default observer(Overlay)
