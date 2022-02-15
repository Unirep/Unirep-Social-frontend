import { ABOUT_URL } from '../../config';

type Props = {
    closeBanner: () => void
}

const Banner = ({ closeBanner }: Props) => {
    return (
        <div className="banner-row">
            <div className="banner">
                <img src="/images/banner.svg" />
                <div className="banner-title">A whole new online experience. <br/> Decentralized, freedom & fully anonymous.</div>
                <div className="banner-content">Stay up to date & share all things about Ethereum.</div>
                <div className="banner-buttons">
                    <a className="banner-button" href={ABOUT_URL}>How it work?</a>
                    <a className="banner-button" href="/signup">Join now</a>
                </div>
                <div className="banner-close" onClick={closeBanner}><img src="/images/close.png" /></div>
            </div>
        </div>
    );
}

export default Banner;