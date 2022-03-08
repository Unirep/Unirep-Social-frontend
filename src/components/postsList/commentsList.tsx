import './postsList.scss';
import '../postBlock/postBlock.scss';
import CommentBlock from '../postBlock/commentBlock';
import { Comment, Page } from '../../constants';
import { LOAD_POST_COUNT } from '../../config';

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
            {
                comments.length > 0 && comments.length % LOAD_POST_COUNT === 0? 
                    <div className="load-more-button" onClick={loadMoreComments}>Load more posts</div> : <div></div>
            }
        </div>
    );
}

export default CommentsList;