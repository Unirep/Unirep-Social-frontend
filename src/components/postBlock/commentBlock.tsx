// import BlockButton from './blockButton';
import { Comment, Page, ButtonType } from '../../constants';
import dateformat from 'dateformat';
import BlockButton from './blockButton';

type Props = {
    comment: Comment
    page: Page,
}

const CommentBlock = ({comment, page}: Props) => {
    const date = dateformat(new Date(comment.post_time), "dd/mm/yyyy hh:MM TT");

    return (
        <div className="comment-block">
            <div className="block-header comment-block-header no-padding">
                <p className="date">{date} |</p>
                <p className="user">Post by {comment.epoch_key} <img src="/images/lighting.png" /> </p>
                <p className="etherscan">Etherscan <img src="/images/etherscan.png" /></p>
            </div>
            <div className="block-content no-padding-horizontal">{comment.content}</div>
            <div className="block-buttons no-padding">
                <BlockButton type={ButtonType.Boost} count={comment.upvote} />
                <BlockButton type={ButtonType.Squash} count={comment.downvote} />
                <BlockButton type={ButtonType.Share} count={0} />
            </div>
        </div>
    );
}

export default CommentBlock;