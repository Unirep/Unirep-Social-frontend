import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { WebContext } from '../../context/WebContext';
import './overlay.scss';

const Overlay = () => {
    const { setIsMenuOpen, isLoading, user, setUser } = useContext(WebContext);
    const history = useHistory();

    const closeOverlay = () => {
        if (!isLoading) {
            console.log('close over lay');
            setIsMenuOpen(false);
        } else {
            console.log('something is loading, no close');
        }        
    }

    const signout = () => {
        setUser(null);
        setIsMenuOpen(false);
        history.push('/');
    }

    return (
        <div className="overlay" onClick={closeOverlay}>
            <div className="blur-area"></div>
            <div className="black-area">
                <div className="close-info">
                    <img src="/images/close.svg" />
                </div>
                <div className="fixed-info">
                    <a href="https://about.unirep.social/how-it-work">How it work</a>
                    <a href="https://about.unirep.social/how-it-work#faq">FAQ</a>
                    <a href="https://about.unirep.social">About</a>
                </div>
                {
                    user === null?
                        <div className="dynamic-info">
                            <a href="/feedback">Send feedback</a>
                            <a href="/login">Sign in</a>
                            <a href="/signup">Join</a>
                        </div> : 
                        <div className="dynamic-info">
                            <a href="/feedback">Send feedback</a>
                            <p onClick={signout}>Sign out</p>
                        </div> 
                }
            </div>
        </div>
    );
}

export default Overlay;