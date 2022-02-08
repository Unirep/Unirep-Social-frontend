type Props = {
    closeBanner: () => void
}

const Banner = ({ closeBanner }: Props) => {
    return (
        <div className="banner-row">
            <div className="banner">
                <img src="/images/banner.svg" />
                <div className="banner-title">Community built on ideas, not identities.</div>
                <div className="banner-content">Stay up to date & share everything with everyone.</div>
                <div className="banner-buttons">
                    <div className="banner-button">How it work?</div>
                    <div className="banner-button">Join us</div>
                </div>
                <div className="banner-close" onClick={closeBanner}><img src="/images/close.png" /></div>
            </div>
        </div>
    );
}

export default Banner;