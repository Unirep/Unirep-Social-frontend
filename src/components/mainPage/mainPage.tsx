import { useContext, useState, useEffect } from 'react';
import { getPostsByQuery } from '../../utils';
import { WebContext } from '../../context/WebContext';
import { MainPageContext } from '../../context/MainPageContext';
import { Page, QueryType, FeedChoices } from '../../constants';
import PostsList from '../postsList/postsList';
import PostField from '../postField/postField';
import VoteBox from '../voteBox/voteBox';
import Feed from '../feed/feed';
import './mainPage.scss';

const MainPage = () => {

    const { shownPosts, setShownPosts, isLoading, user } = useContext(WebContext);

    const [isPostFieldActive, setIsPostFieldActive] = useState(false);
    const [isUpVoteBoxOn, setIsUpVoteBoxOn] = useState(false);
    const [isDownVoteBoxOn, setIsDownVoteBoxOn] = useState(false);
    const [voteReceiver, setVoteReceiver] = useState<any>(null);
    const [postTimeFilter, setPostTimeFilter] = useState(1);
    const [feedChoices, setFeedChoices] = useState<FeedChoices>({
        query0: QueryType.popularity, 
        query1: QueryType.most, 
        query2: QueryType.votes, 
        query3: QueryType.today
    });

    useEffect(() => {
        const getPosts = async () => {
            const end = Date.now();
            let start: number = 0;
            const isTime = feedChoices.query0 === QueryType.time;
            if (!isTime) {
                if (feedChoices.query3 === QueryType.today) {
                    start = end - 24 * 60 * 60 * 1000;
                } else if (feedChoices.query2 === QueryType.this_week) { // this week
                    start = end - 7 * 24 * 60 * 60 * 1000;
                } else if (feedChoices.query3 === QueryType.this_month) { // this month
                    start = end - 30 * 24 * 60 * 60 * 1000;
                } else if (feedChoices.query3 === QueryType.this_year) { // this year
                    start = end - 365 * 24 * 60 * 60 * 1000;
                } else if (feedChoices.query3 === QueryType.all_time) { // all time
                    start = 0;
                }
            }

            const sortedPosts = await getPostsByQuery(
                user === null? [] : user.epoch_keys, 
                feedChoices.query0,
                feedChoices.query1, 
                feedChoices.query2,
                start,
                end
            );
            setShownPosts(sortedPosts);
        }

        getPosts();
    }, [feedChoices]);

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
                    <Feed feedChoices={feedChoices} setFeedChoices={setFeedChoices} />
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