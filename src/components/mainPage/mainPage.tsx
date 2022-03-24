import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { WebContext } from '../../context/WebContext';
import { Page, QueryType, AlertType } from '../../constants';
import SideColumn from '../sideColumn/sideColumn';
import PostsList from '../postsList/postsList';
import Banner from './banner';
import Feed from '../feed/feed';
import './mainPage.scss';
import PostContext from '../../context/Post'
import UserContext from '../../context/User'
import { observer } from 'mobx-react-lite'
import UnirepContext from '../../context/Unirep'

const MainPage = () => {

    const posts = useContext(PostContext)
    const user = useContext(UserContext)
    const unirepConfig = useContext(UnirepContext)

    const history = useHistory();

    const { isLoading } = useContext(WebContext);

    const [query, setQuery] = useState<QueryType>(QueryType.New);
    const [showBanner, setShowBanner] = useState<Boolean>(true);

    const loadMorePosts = () => {
        console.log("load more posts, now posts: " + posts.feedsByQuery[query]?.length);
        const lastPost = [...posts.feedsByQuery[query]].pop()
        posts.loadFeed(query, lastPost?.id)
    }

    useEffect(() => {
        posts.loadFeed(query)
    }, [query]);

    const gotoNewPost = () => {
        if (!isLoading && user !== null && (user.reputation - user.spent) >= unirepConfig.postReputation){
            history.push('/new', {isConfirmed: true});
        }
    }

    return (
        <div className="body-columns">
            <div className="margin-box"></div>
            <div className="content">
                {showBanner? <Banner closeBanner={() => setShowBanner(false)}/> : <div></div>}
                <div className="main-content">
                    <div className="create-post" onClick={gotoNewPost}>
                        { !user.id ? AlertType.postNotLogin :
                            user.reputation - user.spent < unirepConfig.postReputation?
                                AlertType.postNotEnoughPoints : 'Create post'
                        }
                    </div>
                    <Feed feedChoice={query} setFeedChoice={setQuery} />
                    <div>
                        <PostsList
                            posts={posts.feedsByQuery[query] || []}
                            loadMorePosts={loadMorePosts}
                        />
                    </div>
                </div>
                <div className="side-content">
                    <SideColumn page={Page.Home} />
                </div>
            </div>
            <div className="margin-box"></div>
        </div>
    );
};

export default observer(MainPage);
