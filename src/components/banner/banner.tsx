import { useEffect, useState } from 'react';

import './banner.scss';
import { useAuth } from '../../context/AuthContext';

import { ABOUT_URL } from '../../config';

const Banner = () => {
    const { user } = useAuth();
    const [on, setOn] = useState<boolean>(false);

    useEffect(() => {
        if (window.location.pathname === '/') {
            setOn(true);
        }
    }, [])

    return (
        <div className="banner-row">
            {
                on? 
                <div className="banner">
                    <img src="/images/banner.svg" />
                    <div className="banner-title">Community built on ideas, not identities.</div>
                    <div className="banner-content">Stay up to date & share everything with everyone.</div>
                    <div className="banner-buttons">
                        <a className="banner-button" href={ABOUT_URL + "/how-it-works"}>How it works</a>
                        {user === null? <a className="banner-button" href="/signup">Join us</a> : <div></div>}
                    </div>
                    <div className="banner-close" onClick={() => setOn(false)}><img src="/images/close.svg" /></div>
                </div> : <div></div>
            }
        </div>
    );
}

export default Banner;