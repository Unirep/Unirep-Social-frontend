import './postsList.scss';
import '../postBlock/postBlock.scss';
import CommentBlock from '../postBlock/commentBlock';
import { Comment, Page } from '../../constants';

type Props = {
    comments: Comment[],
    page: Page,
    loadMoreComments: () => void
}

const CommentsList = ({comments, page, loadMoreComments}: Props) => {
    return (
        <div className="post-list">
            {comments.length > 0? (
                comments.map((comment, i) => (
                    <div className="post-block" key={comment.id}>
                        <CommentBlock 
                            comment={comment} 
                            page={page}
                        />
                    </div>
                    
                ))
            ) : <div className="no-posts">
                    <img src="/images/glasses.svg" />
                    <p>It's empty here.<br />People just being shy, no post yet.</p>
                </div>
            }
            <div className="load-more-button" onClick={loadMoreComments}>Load More</div>
        </div>
    );
}

export default CommentsList;