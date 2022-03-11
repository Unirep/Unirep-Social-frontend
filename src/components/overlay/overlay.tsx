import { useHistory } from 'react-router-dom';

import './overlay.scss';
import { useAppState } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';


const Overlay = () => {
    const { setIsOverlayOn, isPending } = useAppState();
    const { user, setUser } = useAuth();
    const history = useHistory();

    const closeOverlay = () => {
        if (!isPending) {
            console.log('close over lay');
            setIsOverlayOn(false);
        } else {
            console.log('something is loading, no close');
        }        
    }

    const gotoUserPage = () => {
        history.push(`/user`, {isConfirmed: true});
    }

    const signout = () => {
        setUser(null);
        setIsOverlayOn(false);
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
                    <a href="https://about.unirep.social/how-it-works">How it work</a>
                    <a href="https://about.unirep.social/how-it-works#faq">FAQ</a>
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
                            <p onClick={gotoUserPage}>My stuff</p>
                            <p onClick={signout}>Sign out</p>
                        </div> 
                }
            </div>
        </div>
    );
}

export default Overlay;