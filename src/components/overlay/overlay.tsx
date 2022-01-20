import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { WebContext } from '../../context/WebContext';
import './overlay.scss';

const Overlay = () => {
    const { isMenuOpen, setIsMenuOpen, isLoading, user, setUser } = useContext(WebContext);
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

    const join = () => {
        history.push('/signup');
    }

    const signin = () => {
        history.push('/login');
    }

    return (
        <div className="overlay" onClick={closeOverlay}>
            <div className="blur-area"></div>
            <div className="black-area">
                <div className="close-info">
                    <img src="/images/close.svg" />
                </div>
                <div className="fixed-info">
                    <p>How it work</p>
                    <p>FAQ</p>
                    <p>About</p>
                </div>
                {
                    user === null?
                        <div className="dynamic-info">
                            <p>Send feedback</p>
                            <p onClick={signin}>Sign in</p>
                            <p onClick={join}>Join</p>
                        </div> : 
                        <div className="dynamic-info">
                            <p>Send feedback</p>
                            <p onClick={signout}>Sign out</p>
                        </div> 
                }
            </div>
        </div>
    );
}

export default Overlay;