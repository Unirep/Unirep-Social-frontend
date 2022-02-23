// import BlockButton from './blockButton';
import { useState } from 'react';
import { Comment, Page, ButtonType } from '../../constants';
import dateformat from 'dateformat';
import { useHistory } from 'react-router-dom';
import BlockButton from './blockButton';
import { DEFAULT_COMMENT_KARMA } from '../../config';

type Props = {
    comment: Comment
    page: Page,
}

const CommentBlock = ({comment, page}: Props) => {
    const date = dateformat(new Date(comment.post_time), "dd/mm/yyyy hh:MM TT");
    const history = useHistory();
    const [ isEpkHovered, setEpkHovered] = useState<boolean>(false);

    const gotoPost = () => {
        if (page === Page.User) {
            history.push(`/post/${comment.post_id}`, {commentId: comment.id})
        }
    }

    return (
        <div className="comment-block">
            <div className="block-header comment-block-header no-padding">
                <p className="date">{date} |</p>
                <p className="user" onMouseEnter={() => setEpkHovered(true)} onMouseLeave={() => setEpkHovered(false)}>
                    Post by {comment.epoch_key} <img src="/images/lighting.svg" /> 
                    { isEpkHovered? <div className="show-off-rep">{comment.reputation === DEFAULT_COMMENT_KARMA? `This person is very modest, showing off only ${DEFAULT_COMMENT_KARMA} Rep.` : `This person is showing off ${comment.reputation} Rep.`}</div> : <div></div>}
                </p>
                <a className="etherscan" target="_blank" href={`https://goerli.etherscan.io/tx/${comment.id}`}> 
                    <span>Etherscan</span>
                    <img src="/images/etherscan.svg" />
                </a>
            </div>
            <div className="block-content no-padding-horizontal" onClick={gotoPost}>{comment.content}</div>
            <div className="block-buttons no-padding">
                <BlockButton type={ButtonType.Boost} count={comment.upvote} data={comment} />
                <BlockButton type={ButtonType.Squash} count={comment.downvote} data={comment} />
                <BlockButton type={ButtonType.Share} count={0} data={comment} />
            </div>
        </div>
    );
}

export default CommentBlock;