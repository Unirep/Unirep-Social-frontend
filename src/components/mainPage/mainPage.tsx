import { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import './mainPage.scss';
import { WebContext } from '../../context/WebContext';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppContext';

import BasicPage from '../basicPage/basicPage';
import { getPostsByQuery } from '../../utils';
import { QueryType, AlertType } from '../../constants';
import { DEFAULT_POST_KARMA } from '../../config';
import PostsList from '../postsList/postsList';
import Feed from '../feed/feed';


const MainPage = () => {

    const history = useHistory();

    const { shownPosts, setShownPosts } = useContext(WebContext);
    const { user } = useAuth();
    const { isPending } = useAppState();

    const [query, setQuery] = useState<QueryType>(QueryType.New);

    const getPosts = async (lastRead: string = '0') => {
        console.log('get posts with last read: ' + lastRead + ', query is: ' + query);
        const sortedPosts = await getPostsByQuery(query, lastRead);
        if (lastRead === '0') {
            setShownPosts(sortedPosts);
        } else {
            setShownPosts([...shownPosts, ...sortedPosts]);
        }
    }

    const loadMorePosts = () => {
        console.log("load more posts, now posts: " + shownPosts.length);
        if (shownPosts.length > 0) {
            getPosts(shownPosts[shownPosts.length-1].id);
        } else {
            getPosts();
        }
    }

    useEffect(() => {
        getPosts();
    }, [query]);

    const gotoNewPost = () => {
        if (!isPending && user !== null && (user.reputation - user.spent) >= DEFAULT_POST_KARMA){
            history.push('/new', {isConfirmed: true});
        }
    }

    return (
        <BasicPage>
            <div className="create-post" onClick={gotoNewPost}>
                { user === null? AlertType.postNotLogin : 
                    user.reputation - user.spent < DEFAULT_POST_KARMA? 
                        AlertType.postNotEnoughPoints : 'Create post'
                }
            </div>
            <Feed feedChoice={query} setFeedChoice={setQuery} />
            <PostsList 
                posts={shownPosts} 
                loadMorePosts={loadMorePosts}
            />
        </BasicPage>
    );
};

export default MainPage;