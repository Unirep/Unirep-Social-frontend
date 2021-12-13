
const Banner = () => {
    return (
        <div className="banner-row">
            <div className="banner">
                <img src="/images/banner.png" />
                <div className="banner-title">A whole new online experience. <br/> Decentralized, freedom & fully anonymous.</div>
                <div className="banner-content">Stay up to date & share all things about Ethereum.</div>
                <div className="banner-buttons">
                    <div className="banner-button">How it work?</div>
                    <div className="banner-button">Join now</div>
                </div>
                <div className="banner-close"><img src="/images/close-banner.png" /></div>
            </div>
        </div>
    );
}

export default Banner;