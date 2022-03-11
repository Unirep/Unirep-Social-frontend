import { useAuth } from '../../context/AuthContext';

import { ABOUT_URL } from '../../config';


type Props = {
    closeBanner: () => void
}

const Banner = ({ closeBanner }: Props) => {
    const { user } = useAuth();
    return (
        <div className="banner-row">
            <div className="banner">
                <img src="/images/banner.svg" />
                <div className="banner-title">Community built on ideas, not identities.</div>
                <div className="banner-content">Stay up to date & share everything with everyone.</div>
                <div className="banner-buttons">
                    <a className="banner-button" href={ABOUT_URL + "/how-it-works"}>How it works</a>
                    {user === null? <a className="banner-button" href="/signup">Join us</a> : <div></div>}
                </div>
                <div className="banner-close" onClick={closeBanner}><img src="/images/close.svg" /></div>
            </div>
        </div>
    );
}

export default Banner;