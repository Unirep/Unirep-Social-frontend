import { useContext } from 'react';

import PostBlock from '../postBlock/postBlock';
import { Post, Page, diffDays } from '../../constants';
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
                        commentId={undefined}
                    />
                ))
            }
            <div className="load-more-button" onClick={loadMorePosts}>Load more posts</div>
        </div>
    );
}

export default PostsList;