import { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Post, Comment, ButtonType } from '../../constants';
import { WebContext } from '../../context/WebContext';
import VoteBox from '../voteBox/voteBox';

type Props = {
    type: ButtonType
    count: number
    data: Post | Comment
}

const BlockButton = ({ type, count, data }: Props) => {
    
    const history = useHistory();
    const { user, isLoading, setIsLoading } = useContext(WebContext);

    const [isBoostOn, setBoostOn] = useState<boolean>(false);
    const [isSquashOn, setSquashOn] = useState<boolean>(false);
    const [isHover, setIsHover] = useState<boolean>(false); // null, purple1, purple2, grey1, grey2
    const [reminder, setReminder] = useState<string>('');
    const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false); // only for share button
    
    const checkAbility = () => {
        if (type === ButtonType.Comments || type === ButtonType.Share) {
            return true;
        } else {
            if (user === null) return false;
            else {
                if (data.current_epoch !== user.current_epoch) return false;
                else if (user.reputation - user.spent < 1) return false;
                else if (isLoading) return false;
                else return true;
            }
        }
    }
    
    const [isAble, setIsAble] = useState<boolean>(() => checkAbility());

    const onClick = () => {
        if (isAble) {
            if (type === ButtonType.Comments) {
                history.push(`/post/${data.id}`, {commentId: ''});
            } else if (type === ButtonType.Boost) {
                setBoostOn(true);
            } else if (type === ButtonType.Squash) {
                setSquashOn(true);
            } else if (type === ButtonType.Share) {
                navigator.clipboard.writeText(`https://unirep.social/post/${data.id}`);
                setIsLinkCopied(true);
            }
        }
        setIsHover(false);
    }

    const onMouseOut = () => {
        setIsHover(false);
        setReminder('');
    }

    const setReminderMessage = () => {
        if (user === null) setReminder('Join us :)');
        else {
            if (data.current_epoch !== user.current_epoch) setReminder('Time out :(');
            else if (user.reputation - user.spent < 1) setReminder('No enough Rep');
            else if (isLoading && type !== ButtonType.Share) setReminder('loading...');
        }
    }

    useEffect(() => {
        if (isLinkCopied) {
            setReminder('Link Copied!');
            const timer = setTimeout(() => {
                setReminder('');
                setIsLinkCopied(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isLinkCopied])

    window.addEventListener("storage", (e) => {
        if (e.key === 'isLoading') {
            if (e.newValue === 'true') {
                setIsLoading(true);
                setIsAble(false);
            } else {
                setIsAble(checkAbility());
            }
        } 
    });

    useEffect(() => {
        if (isLoading) setIsAble(false);
        else setIsAble(checkAbility());
    }, [isLoading])

    return (
        <div 
            className={type === ButtonType.Share? "block-button share" : "block-button"} 
            onMouseEnter={() => setIsHover(true)} 
            onMouseOut={onMouseOut}
            onClick={onClick}>
            <img src={`/images/${type}${isHover && isAble? '-fill' : ''}.svg`} />
            {   
                type !== ButtonType.Share? 
                    <span className="count">{count}</span> : <span></span>
            }
            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>

            {
                isAble? <div></div> : <div className="disabled" onMouseEnter={setReminderMessage}></div>
            }
            {
                reminder.length > 0? 
                    <div className="reminder">
                        {reminder}
                    </div> : <div></div>
            }
            {
                isBoostOn? 
                    <VoteBox isUpvote={true} data={data} closeVote={() => setBoostOn(false)} /> : isSquashOn? 
                    <VoteBox isUpvote={false} data={data} closeVote={() => setSquashOn(false)}  /> : <div></div>
            }
        </div>
    );
}

export default BlockButton;
