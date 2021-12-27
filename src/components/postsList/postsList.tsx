import { useContext } from 'react';

import PostBlock from '../postBlock/postBlock';
import { Post, Page, diffDays } from '../../constants';
import './postsList.scss';

type Props = {
    posts: Post[],
    timeFilter: number,
    loadMorePosts: () => void
}

const PostsList = ({ posts, timeFilter, loadMorePosts }: Props) => {
    const chosenPosts = posts.filter(post => diffDays(post.post_time, Date.now()) <= timeFilter);
    const otherPosts = posts.filter(post => diffDays(post.post_time, Date.now()) > timeFilter)

    return (
        <div>
            {chosenPosts.length > 0? (
                chosenPosts.map((post, i) => (
                    <PostBlock 
                        key={post.id + i} 
                        post={post} 
                        page={Page.Home}
                        commentId={undefined}
                        setPostToShow={() => {}}
                    />
                ))
            ) : <p>No posts are available. Load other popular posts.</p>}
            { chosenPosts.length > 0? <div className="split-text">- End of available posts. Load other popular posts. -</div> : <div></div>}
            {
                otherPosts.map((post, i) => (
                    <PostBlock 
                        key={post.id + i} 
                        post={post} 
                        page={Page.Home}
                        commentId={undefined}
                        setPostToShow={() => {}}
                    />
                ))
            }
            <div className="load-more-button" onClick={loadMorePosts}>Load more posts</div>
        </div>
    );
}

export default PostsList;