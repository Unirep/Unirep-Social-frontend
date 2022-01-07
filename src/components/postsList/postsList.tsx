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
    // const otherPosts = posts.filter(post => diffDays(post.post_time, Date.now()) > timeFilter)

    return (
        <div className="post-list">
            {chosenPosts.length > 0? (
                chosenPosts.map((post, i) => (
                    <PostBlock 
                        key={post.id + i} 
                        post={post} 
                        page={Page.Home}
                        commentId={undefined}
                    />
                ))
            ) : <div className="no-posts">
                    <img src="/images/glasses.svg" />
                    <p>It's empty here.<br />People just being shy, no post yet.</p>
                </div>
            }
            {/* { chosenPosts.length > 0? <div className="split-text">- End of available posts. Load other popular posts. -</div> : <div></div>}
            {
                otherPosts.map((post, i) => (
                    <PostBlock 
                        key={post.id + i} 
                        post={post} 
                        page={Page.Home}
                        commentId={undefined}
                    />
                ))
            } */}
            <div className="load-more-button" onClick={loadMorePosts}>Load more posts</div>
        </div>
    );
}

export default PostsList;