import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Jdenticon from 'react-jdenticon';
import { Post, Comment, DataType, Page, isVotedText, isAuthorText, notLoginText, loadingText, expiredText, ButtonType } from '../../constants';
import { WebContext } from '../../context/WebContext';
import VoteBox from '../voteBox/voteBox';

type Props = {
    type: ButtonType
    count: number
    data: Post | Comment
}

const BlockButton = ({ type, count, data }: Props) => {
    
    const history = useHistory();
    const { user, isLoading } = useContext(WebContext);

    const [isBoostOn, setBoostOn] = useState<boolean>(false);
    const [isSquashOn, setSquashOn] = useState<boolean>(false);
    const [isHover, setIsHover] = useState<boolean>(false); // null, purple1, purple2, grey1, grey2
    const [hoverText, setHoverText] = useState<string>('');
    // const isSameEpoch: boolean = user?.current_epoch === data.current_epoch;

    const setIsUpVoteBoxOn = (value: boolean) => {
        // if (page === Page.Home) {
        //     setIsMainPageUpVoteBoxOn(value);
        // } else if (page === Page.Post) {
        //     setIsPostPageUpVoteBoxOn(value);
        // } else {
        //     console.error('no such page');
        // }
    }

    const setIsDownVoteBoxOn = (value: boolean) => {
        // if (page === Page.Home) {
        //     setIsMainPageDownVoteBoxOn(value);
        // } else if (page === Page.Post) {
        //     setIsPostPageDownVoteBoxOn(value);
        // } else {
        //     console.error('no such page');
        // }
    }

    const setVoteReceiver = (value: Post|Comment|null) => {
        // if (page === Page.Home) {
        //     setMainPageVoteReceiver(value);
        // } else if (page === Page.Post) {
        //     setPostPageVoteReceiver(value);
        // } else {
        //     console.error('no such page');
        // }
    }

    const openUpvote = (event: any) => {
        event.stopPropagation();
        // if (!isLoading) {
        //     setIsUpVoteBoxOn(true);
        //     if (data.type === DataType.Post) {
        //         setVoteReceiver(data as Post);
        //     } else {
        //         setVoteReceiver(data as Comment);
        //     }
        // }
    }

    const openDownvote = (event: any) => {
        event.stopPropagation();
        // if (!isLoading) {
        //     setIsDownVoteBoxOn(true);
        //     if (data.type === DataType.Post) {
        //         setVoteReceiver(data as Post);
        //     } else {
        //         setVoteReceiver(data as Comment);
        //     }
        // }
    }

    const setOnHover = (element: string) => {
        // setIsHover(element);
        // if (element === 'purple1' || element === 'purple2') {
        //     setHoverText(isVotedText);
        // } else if (element === 'grey1' || element === 'grey2') {
        //     if (isLoading) {
        //         setHoverText(loadingText);
        //     } else if (user === null) {
        //         setHoverText(notLoginText);
        //     } else if (data.isAuthor) {
        //         setHoverText(isAuthorText);
        //     } else if (!isSameEpoch) {
        //         setHoverText(expiredText);
        //     }
        // }
    }

    const setOnLeave = () => {
        // setIsHover(null);
        setHoverText('');
    }

    const onClick = () => {
        if (type === ButtonType.Comments) {
            history.push(`/post/${data.id}`, {commentId: ''});
        } else if (type === ButtonType.Boost) {
            setBoostOn(true);
        } else if (type === ButtonType.Squash) {
            setSquashOn(true);
        } else if (type === ButtonType.Share) {

        }
        setIsHover(false);
    }

    return (
        <div 
            className={type === ButtonType.Share? "block-button share" : "block-button"} 
            onMouseEnter={() => setIsHover(true)} 
            onMouseLeave={() => setIsHover(false)}
            onClick={onClick}
        >
            <img src={`/images/${type}${isHover? '-fill' : ''}.svg`} />
            {   
                type !== ButtonType.Share? 
                    <span className="count">{count}</span> : <span></span>
            }
            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            {
                isBoostOn? 
                    <VoteBox isUpvote={true} data={data} closeVote={() => setBoostOn(false)} /> : isSquashOn? 
                    <VoteBox isUpvote={false} data={data} closeVote={() => setSquashOn(false)}  /> : <div></div>
            }
        </div>
    );
}

export default BlockButton;
