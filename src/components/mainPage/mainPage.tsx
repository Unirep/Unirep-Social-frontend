import { useContext, useState, useEffect } from 'react';
import { listAllPosts } from '../../utils';
import { WebContext } from '../../context/WebContext';
import { MainPageContext } from '../../context/MainPageContext';
import { Page } from '../../constants';
import PostsList from '../postsList/postsList';
import PostField from '../postField/postField';
import VoteBox from '../voteBox/voteBox';
import Feed from '../feed/feed';
import './mainPage.scss';

const MainPage = () => {

    const { shownPosts, setShownPosts, isLoading } = useContext(WebContext);

    const [isPostFieldActive, setIsPostFieldActive] = useState(false);
    const [isUpVoteBoxOn, setIsUpVoteBoxOn] = useState(false);
    const [isDownVoteBoxOn, setIsDownVoteBoxOn] = useState(false);
    const [voteReceiver, setVoteReceiver] = useState<any>(null);
    const [postTimeFilter, setPostTimeFilter] = useState(1);

    useEffect(() => {
        const getPosts = async () => {
            const ret = await listAllPosts();
            setShownPosts(ret);
        }

        getPosts();
    }, []);

    const loadMorePosts = () => {
        console.log("load more posts, now posts: " + shownPosts.length);
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
        <div className="default-gesture" onClick={closeAll}>
            <MainPageContext.Provider value={{
                    isPostFieldActive, setIsPostFieldActive,
                    isMainPageUpVoteBoxOn: isUpVoteBoxOn, setIsMainPageUpVoteBoxOn: setIsUpVoteBoxOn, 
                    isMainPageDownVoteBoxOn: isDownVoteBoxOn, setIsMainPageDownVoteBoxOn: setIsDownVoteBoxOn,
                    mainPageVoteReceiver: voteReceiver, setMainPageVoteReceiver: setVoteReceiver,
                    postTimeFilter, setPostTimeFilter}}>
                <div className="main-content">
                    <PostField page={Page.Home}/>
                    <Feed />
                    <div className="post-list"><PostsList posts={shownPosts} /></div>
                    <div className="main-page-button" onClick={loadMorePosts}>Load More Posts</div>
                </div>
                { voteReceiver !== null?
                    (isUpVoteBoxOn? <VoteBox isUpvote={true} data={voteReceiver} /> : 
                    isDownVoteBoxOn? <VoteBox isUpvote={false} data={voteReceiver} /> : <div></div>) : <div></div>
                }
            </MainPageContext.Provider>
        </div>
    );
};

export default MainPage;