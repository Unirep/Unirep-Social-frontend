import PostBlock from '../postBlock/postBlock';
import { Post, Page } from '../../constants';
import { LOAD_POST_COUNT } from '../../config';
import './postsList.scss';

type Props = {
    posts: Post[],
    loadMorePosts: () => void
}

const PostsList = ({ posts, loadMorePosts }: Props) => {

    return (
        <div className="post-list">
            {
                posts.map((post, i) => (
                    <PostBlock 
                        key={post.id + i} 
                        post={post} 
                        page={Page.Home}
                    />
                ))
            }
            {
                posts.length % LOAD_POST_COUNT === 0? 
                    <div className="load-more-button" onClick={loadMorePosts}>Load more posts</div> : <div></div>
            }
        </div>
    );
}

export default PostsList;