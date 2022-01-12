import { useContext, useState } from 'react';
import Jdenticon from 'react-jdenticon';
import { Post, Comment, DataType, Page, isVotedText, isAuthorText, notLoginText, loadingText, expiredText, offChainText } from '../../constants';
import './blockHeader.scss';
import { WebContext } from '../../context/WebContext';
import { MainPageContext } from '../../context/MainPageContext';
import { PostPageContext } from '../../context/PostPageContext';

type Props = {
    data: Post | Comment,
    page: Page,
}

const BlockHeader = ({ data, page }: Props) => {
    
    const { user, isLoading } = useContext(WebContext);
    const { setIsMainPageUpVoteBoxOn, setIsMainPageDownVoteBoxOn, setMainPageVoteReceiver } = useContext(MainPageContext);
    const { setIsPostPageUpVoteBoxOn, setIsPostPageDownVoteBoxOn, setPostPageVoteReceiver } = useContext(PostPageContext);

    const [isHover, setIsHover] = useState<null|string>(null); // null, purple1, purple2, grey1, grey2
    const [hoverText, setHoverText] = useState<string>('');
    const isSameEpoch: boolean = user?.current_epoch === data.current_epoch;

    const setIsUpVoteBoxOn = (value: boolean) => {
        if (page === Page.Home) {
            setIsMainPageUpVoteBoxOn(value);
        } else if (page === Page.Post) {
            setIsPostPageUpVoteBoxOn(value);
        } else {
            console.error('no such page');
        }
    }

    const setIsDownVoteBoxOn = (value: boolean) => {
        if (page === Page.Home) {
            setIsMainPageDownVoteBoxOn(value);
        } else if (page === Page.Post) {
            setIsPostPageDownVoteBoxOn(value);
        } else {
            console.error('no such page');
        }
    }

    const setVoteReceiver = (value: Post|Comment|null) => {
        if (page === Page.Home) {
            setMainPageVoteReceiver(value);
        } else if (page === Page.Post) {
            setPostPageVoteReceiver(value);
        } else {
            console.error('no such page');
        }
    }

    const openUpvote = (event: any) => {
        event.stopPropagation();
        if (!isLoading) {
            setIsUpVoteBoxOn(true);
            if (data.type === DataType.Post) {
                setVoteReceiver(data as Post);
            } else {
                setVoteReceiver(data as Comment);
            }
        }
    }

    const openDownvote = (event: any) => {
        event.stopPropagation();
        if (!isLoading) {
            setIsDownVoteBoxOn(true);
            if (data.type === DataType.Post) {
                setVoteReceiver(data as Post);
            } else {
                setVoteReceiver(data as Comment);
            }
        }
    }

    const setOnHover = (element: string) => {
        setIsHover(element);
        if (element === 'purple1' || element === 'purple2') {
            setHoverText(isVotedText);
        } else if (element === 'grey1' || element === 'grey2') {
            if (isLoading) {
                setHoverText(loadingText);
            } else if (user === null) {
                setHoverText(notLoginText);
            } else if (data.isAuthor) {
                setHoverText(isAuthorText);
            } else if (!isSameEpoch) {
                setHoverText(expiredText);
            } else if (data.proofIndex === 0) {
                setHoverText(offChainText);
            }
        }
    }

    const setOnLeave = () => {
        setIsHover(null);
        setHoverText('');
    }

    return (
        <div className="block-header">
            <div className="epk-icon"><Jdenticon size="24" value={data.epoch_key} /></div>
            <div className="rep">{data.reputation}</div>
            <div className="epk">{data.epoch_key}</div>
            <div className="vote-button-box">
                {
                    data.isUpvoted? (
                        <div className="vote vote-purple" onMouseOver={() => setOnHover('purple1')} onMouseLeave={setOnLeave}><img src="/images/upvote-purple.png" />{data.upvote}</div>
                    ) : user && !isLoading && !data.isAuthor && isSameEpoch && data.proofIndex !== 0? (
                        <div className="vote" onClick={openUpvote}><img src="/images/upvote.png"/>{data.upvote}</div>
                    ) : (
                        <div className="vote disabled" onMouseOver={() => setOnHover('grey1')} onMouseLeave={setOnLeave}><img src="/images/upvote.png"/>{data.upvote}</div>
                    )
                }
                {
                    isHover === "purple1" || isHover === "grey1" ? <div className="hover-box">{hoverText}</div> : <div></div>
                }
            </div>
            <div className="vote-button-box">
                {
                    data.isDownvoted? (
                        <div className="vote vote-purple" onMouseOver={() => setOnHover('purple2')} onMouseLeave={setOnLeave}><img src="/images/downvote-purple.png"/>{data.downvote}</div>
                    ) : user && !isLoading && !data.isAuthor && isSameEpoch? (
                        <div className="vote" onClick={openDownvote}><img src="/images/downvote.png"/>{data.downvote}</div>
                    ) : (
                        <div className="vote disabled" onMouseOver={() => setOnHover('grey2')} onMouseLeave={setOnLeave}><img src="/images/downvote.png"/>{data.downvote}</div>
                    )
                }
                {
                    isHover === "purple2" || isHover === "grey2" ? <div className="hover-box">{hoverText}</div> : <div></div>
                }
            </div>
        </div>
    );
}

export default BlockHeader;
