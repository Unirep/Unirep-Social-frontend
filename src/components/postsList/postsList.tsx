import { useContext } from 'react';

import PostBlock from '../postBlock/postBlock';
import { Post, Page, diffDays } from '../../constants';
import './postsList.scss';

type Props = {
    posts: Post[],
    timeFilter: number,
}

const PostsList = ({ posts, timeFilter }: Props) => {
    const chosenPosts = posts.filter(post => diffDays(post.post_time, Date.now()) <= timeFilter);
    const otherPosts = posts.filter(post => diffDays(post.post_time, Date.now()) > timeFilter)

    return (
        <div>
            {chosenPosts.length > 0? (
                chosenPosts.map((post) => (
                    <PostBlock 
                        key={post.id} 
                        post={post} 
                        page={Page.Home}
                        commentId={undefined}
                    />
                ))
            ) : <p>No posts are available. Load other popular posts.</p>}
            { chosenPosts.length > 0? <div className="split-text">- End of available posts. Load other popular posts. -</div> : <div></div>}
            {
                otherPosts.map((post) => (
                    <PostBlock 
                        key={post.id} 
                        post={post} 
                        page={Page.Home}
                        commentId={undefined}
                    />
                ))
            }
        </div>
    );
}

export default PostsList;