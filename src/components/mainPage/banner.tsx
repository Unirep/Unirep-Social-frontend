import { useContext } from 'react';
import { ABOUT_URL } from '../../config';
import UserContext from '../../context/User'

type Props = {
    closeBanner: () => void
}

const Banner = ({ closeBanner }: Props) => {
    const user = useContext(UserContext);
    return (
        <div className="banner-row">
            <div className="banner">
                <img src={require('../../../public/images/banner.svg')} />
                <div className="banner-title">Community built on ideas, not identities.</div>
                <div className="banner-content">Stay up to date & share everything with everyone.</div>
                <div className="banner-buttons">
                    <a className="banner-button" href={ABOUT_URL + "/how-it-works"}>How it works</a>
                    {!user.identity ? <a className="banner-button" href="/signup">Join us</a> : <div></div>}
                </div>
                <div className="banner-close" onClick={closeBanner}><img src={require('../../../public/images/close.svg')} /></div>
            </div>
        </div>
    );
}

export default Banner;
