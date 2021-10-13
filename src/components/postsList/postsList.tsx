import { useContext } from 'react';

import PostBlock from '../postBlock/postBlock';
import { Post, Page, diffDays } from '../../constants';
import { MainPageContext } from '../../context/MainPageContext';
import './postsList.scss';

type Props = {
    posts: Post[],
}

const PostsList = ({ posts }: Props) => {
    const { postTimeFilter } = useContext(MainPageContext);
    const chosenPosts = posts.filter(post => diffDays(post.post_time, Date.now()) <= postTimeFilter);
    const otherPosts = posts.filter(post => diffDays(post.post_time, Date.now()) > postTimeFilter)

    return (
        <div>
            {chosenPosts.length > 0? (
                chosenPosts.map((post) => (
                    <PostBlock 
                        key={post.id} 
                        post={post} 
                        page={Page.Home}
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
                    />
                ))
            }
        </div>
    );
}

export default PostsList;