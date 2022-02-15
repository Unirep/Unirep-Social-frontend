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
                <div className="banner-title">A whole new online experience. <br/> Decentralized, freedom & fully anonymous.</div>
                <div className="banner-content">Stay up to date & share all things about Ethereum.</div>
                <div className="banner-buttons">
                    <a className="banner-button" href={ABOUT_URL + "/how-it-work"}>How it work?</a>
                    {user === null? <a className="banner-button" href="/signup">Join now</a> : <div></div>}
                </div>
                <div className="banner-close" onClick={closeBanner}><img src="/images/close.svg" /></div>
            </div>
        </div>
    );
}

export default Banner;