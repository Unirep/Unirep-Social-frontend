import React, { useContext } from 'react';
import { WebContext } from '../../context/WebContext';
import * as Constants from '../../constants';
import SignUp from './signup';
import SignIn from './signin';

const Overlay = () => {
    const { pageStatus, setPageStatus, isLoading } = useContext(WebContext);

    const closeOverlay = () => {
        if (!isLoading) {
            console.log('close over lay');
            setPageStatus(Constants.PageStatus.None);
        } else {
            console.log('something is loading, no close');
        }        
    }

    return (
        <div className="overlay" onClick={closeOverlay}>
            {pageStatus === Constants.PageStatus.SignUp? 
                <SignUp /> : pageStatus == Constants.PageStatus.SignIn?
                <SignIn /> : <div></div>}
        </div>
    );
}

export default Overlay;