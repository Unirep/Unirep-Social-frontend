import './shareBox.scss';

type Props = {
    url: string
    closeBox: () => void
}

const ShareBox = ({ url, closeBox } : Props) => {

    return (
        <div className="share-overlay">
            <div className="share-box">
                <div className="close">
                    <img src="/images/close-white.svg" onClick={closeBox} />
                </div>
                <div className="title">
                    <img src={`/images/share.svg`} />
                    Share This Post
                </div>
            </div>
        </div>
    );
}

export default ShareBox;