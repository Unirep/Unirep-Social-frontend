import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Post, Comment, ButtonType } from '../../constants';
import VoteBox from '../voteBox/voteBox';
import ShareBox from '../shareBox/shareBox';

type Props = {
    type: ButtonType
    count: number
    data: Post | Comment
}

const BlockButton = ({ type, count, data }: Props) => {
    
    const history = useHistory();

    const [isBoostOn, setBoostOn] = useState<boolean>(false);
    const [isSquashOn, setSquashOn] = useState<boolean>(false);
    const [isHover, setIsHover] = useState<boolean>(false); // null, purple1, purple2, grey1, grey2
    const [isShareOn, setShareOn] = useState<boolean>(false);

    const onClick = () => {
        if (type === ButtonType.Comments) {
            history.push(`/post/${data.id}`, {commentId: ''});
        } else if (type === ButtonType.Boost) {
            setBoostOn(true);
        } else if (type === ButtonType.Squash) {
            setSquashOn(true);
        } else if (type === ButtonType.Share) {
            setShareOn(true);
        }
        setIsHover(false);
    }

    return (
        <div 
            className={type === ButtonType.Share? "block-button share" : "block-button"} 
            onMouseEnter={() => setIsHover(true)} 
            onMouseOut={() => setIsHover(false)}
            onClick={onClick}>
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
            { 
                isShareOn?
                    <ShareBox url={`http://localhost:3000/post/${data.id}`} closeBox={() => setShareOn(false)} /> : <div></div>
            }
        </div>
    );
}

export default BlockButton;
