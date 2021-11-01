import { useContext } from 'react';

import PostField from '../postField/postField';
import Feed from '../feed/feed';
import PostsList from '../postsList/postsList';
import { WebContext } from '../../context/WebContext';
import { Page } from '../../constants';

const UserPosts = () => {
    const { user, shownPosts } = useContext(WebContext); 
    const userPosts = user !== null? [...shownPosts].filter((p) => user.all_epoch_keys.find(epk => epk === p.epoch_key) !== undefined) : shownPosts;

    return (
        <div className="user-page-main-content">
            <PostField page={Page.User} />
            <h3>My Posts</h3>
            <Feed />
            <div className="post-list"><PostsList posts={userPosts} /></div>
        </div>
    );
}

export default UserPosts;