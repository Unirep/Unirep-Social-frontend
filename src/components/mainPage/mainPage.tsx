import { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { getPostsByQuery } from '../../utils';
import { WebContext } from '../../context/WebContext';
import { MainPageContext } from '../../context/MainPageContext';
import { Page, QueryType } from '../../constants';
import SideColumn from '../sideColumn/sideColumn';
import PostsList from '../postsList/postsList';
import Banner from './banner';
import Feed from '../feed/feed';
import './mainPage.scss';

const MainPage = () => {

    const history = useHistory();

    const { shownPosts, setShownPosts, isLoading, user } = useContext(WebContext);

    const [isPostFieldActive, setIsPostFieldActive] = useState(false);
    const [isUpVoteBoxOn, setIsUpVoteBoxOn] = useState(false);
    const [isDownVoteBoxOn, setIsDownVoteBoxOn] = useState(false);
    const [voteReceiver, setVoteReceiver] = useState<any>(null);
    const [query, setQuery] = useState<QueryType>(QueryType.New);
    const [showBanner, setShowBanner] = useState<Boolean>(true);

    const getPosts = async (lastRead: string = '0') => {
        console.log('get posts with last read: ' + lastRead);
        const sortedPosts = await getPostsByQuery(user? user.all_epoch_keys : [], query, lastRead);
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
        if (user !== null){
            history.push('/new');
        }
    }

    const closeAll = () => {
        if (!isLoading) {
            setIsPostFieldActive(false);
            setIsUpVoteBoxOn(false);
            setIsDownVoteBoxOn(false);
            setVoteReceiver(null);
        }
    }

    return (
        <div className="wrapper">
            {showBanner? <Banner closeBanner={() => setShowBanner(false)}/> : <div></div>}
            <div className="default-gesture" onClick={closeAll}>
                <MainPageContext.Provider value={{
                        isPostFieldActive, setIsPostFieldActive,
                        isMainPageUpVoteBoxOn: isUpVoteBoxOn, setIsMainPageUpVoteBoxOn: setIsUpVoteBoxOn, 
                        isMainPageDownVoteBoxOn: isDownVoteBoxOn, setIsMainPageDownVoteBoxOn: setIsDownVoteBoxOn,
                        mainPageVoteReceiver: voteReceiver, setMainPageVoteReceiver: setVoteReceiver}}>
                    <div className="margin-box"></div>
                    <div className="main-content">
                        <div className="create-post" onClick={gotoNewPost}>{user === null? 'You must join or login to create post' : 'Create post'}</div>
                        <Feed feedChoice={query} setFeedChoice={setQuery} />
                        <div>
                            <PostsList 
                                posts={shownPosts} 
                                // timeFilter={feedChoices.query0 === QueryType.popularity? getQueryPeriod() : 100000000} 
                                loadMorePosts={loadMorePosts}
                            />
                        </div>
                    </div>
                    <div className="side-content">
                        <SideColumn page={Page.Home} />
                    </div>
                    <div className="margin-box"></div>
                    {/* { voteReceiver !== null?
                        (isUpVoteBoxOn? <VoteBox isUpvote={true} data={voteReceiver} /> : 
                        isDownVoteBoxOn? <VoteBox isUpvote={false} data={voteReceiver} /> : <div></div>) : <div></div>
                    } */}
                </MainPageContext.Provider>
            </div>
        </div>
    );
};

export default MainPage;