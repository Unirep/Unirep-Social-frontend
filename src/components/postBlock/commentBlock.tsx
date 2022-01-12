import BlockHeader from './blockHeader';
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
            <BlockHeader data={comment} page={page} />
            <div className="divider" />
            <div className="comment-block-info">
                <div className="datetime-text">{date}</div>
                <div className="datetime-text">|</div>
                <a className="etherscan" target="_blank" href={`https://goerli.etherscan.io/tx/${comment.id}`}> 
                    <span>Etherscan</span>
                    <img src="/images/etherscan.png" />
                </a>
            </div>
            <p>{comment.content}</p>
        </div>
    );
}

export default CommentBlock;