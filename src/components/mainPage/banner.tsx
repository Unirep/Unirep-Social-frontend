import { useContext } from 'react';
import { ABOUT_URL } from '../../config';
import { WebContext } from '../../context/WebContext';

type Props = {
    closeBanner: () => void
}

const Banner = ({ closeBanner }: Props) => {
    const { user } = useContext(WebContext);
    return (
        <div className="banner-row">
            <div className="banner">
                <img src="/images/banner.svg" />
                <div className="banner-title">Community built on ideas, not identities.</div>
                <div className="banner-content">Stay up to date & share everything with everyone.</div>
                <div className="banner-buttons">
                    <a className="banner-button" href={ABOUT_URL + "/how-it-work"}>How it works?</a>
                    {user === null? <a className="banner-button" href="/signup">Join us</a> : <div></div>}
                </div>
                <div className="banner-close" onClick={closeBanner}><img src="/images/close.svg" /></div>
            </div>
        </div>
    );
}

export default Banner;