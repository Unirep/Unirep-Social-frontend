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
    const [feedChoice, setFeedChoice] = useState<QueryType>(QueryType.New);

    const getPosts = async (lastRead: string = '0') => {
        // const end = Date.now();
        // let start: number = 0;
        // const isTime = feedChoices.query0 === QueryType.time;
        // if (!isTime) {
        //     if (feedChoices.query3 === QueryType.today) {
        //         start = end - 24 * 60 * 60 * 1000;
        //     } else if (feedChoices.query2 === QueryType.this_week) { // this week
        //         start = end - 7 * 24 * 60 * 60 * 1000;
        //     } else if (feedChoices.query3 === QueryType.this_month) { // this month
        //         start = end - 30 * 24 * 60 * 60 * 1000;
        //     } else if (feedChoices.query3 === QueryType.this_year) { // this year
        //         start = end - 365 * 24 * 60 * 60 * 1000;
        //     } else if (feedChoices.query3 === QueryType.all_time) { // all time
        //         start = 0;
        //     }
        // }

        // const sortedPosts = await getPostsByQuery(
        //     user === null? [] : user.epoch_keys, 
        //     feedChoices.query1, // sort
        //     feedChoices.query0, // maintype
        //     feedChoices.query2, // subtype
        //     start,
        //     end,
        //     lastRead
        // );
        // if (lastRead === '0') {
        //     setShownPosts(sortedPosts);
        // } else {
        //     setShownPosts([...shownPosts, ...sortedPosts]);
        // }
    }

    const loadMorePosts = () => {
        console.log("load more posts, now posts: " + shownPosts.length);
        if (shownPosts.length > 0) {
            getPosts(shownPosts[shownPosts.length-1].id);
        } else {
            getPosts();
        }
    }

    // useEffect(() => {
    //     getPosts();
    // }, [feedChoices]);

    const getQueryPeriod = () => {
        // if (feedChoices.query3 === QueryType.today) return 1;
        // else if (feedChoices.query3 === QueryType.this_week) return 7;
        // else if (feedChoices.query3 === QueryType.this_month) return 30;
        // else if (feedChoices.query3 === QueryType.this_year) return 365;
        // else return 100000000;
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
                    mainPageVoteReceiver: voteReceiver, setMainPageVoteReceiver: setVoteReceiver}}>
                <div className="margin-box"></div>
                <div className="main-content">
                    <div className="create-post">Create post</div>
                    <Feed feedChoice={feedChoice} setFeedChoice={setFeedChoice} />
                    <div className="post-list">
                        <PostsList 
                            posts={shownPosts} 
                            // timeFilter={feedChoices.query0 === QueryType.popularity? getQueryPeriod() : 100000000} 
                            loadMorePosts={loadMorePosts} 
                            timeFilter={100000000}
                        />
                    </div>
                </div>
                <div className="side-content">
                    side side
                </div>
                <div className="margin-box"></div>
                { voteReceiver !== null?
                    (isUpVoteBoxOn? <VoteBox isUpvote={true} data={voteReceiver} /> : 
                    isDownVoteBoxOn? <VoteBox isUpvote={false} data={voteReceiver} /> : <div></div>) : <div></div>
                }
            </MainPageContext.Provider>
        </div>
    );
};

export default MainPage;