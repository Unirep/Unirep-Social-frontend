// import BlockButton from './blockButton';
import { Comment, Page } from '../../constants';
import dateformat from 'dateformat';

type Props = {
    comment: Comment
    page: Page,
}

const CommentBlock = ({comment, page}: Props) => {
    const date = dateformat(new Date(comment.post_time), "dd/mm/yyyy hh:MM TT");

    return (
        <div className="comment">
            <div className="divider" />
            <div className="comment-block-info">
                <div className="datetime-text">{date}</div>
                <div className="datetime-text">|</div>
                <div className="etherscan"> 
                    <span>Etherscan</span>
                    <img src="/images/etherscan.png" />
                </div>
            </div>
            <p>{comment.content}</p>
        </div>
    );
}

export default CommentBlock;