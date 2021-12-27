import { useContext, useState, useEffect } from 'react';

import PostField from '../postField/postField';
import Feed from '../feed/feed';
import PostsList from '../postsList/postsList';
import { WebContext } from '../../context/WebContext';
import { Page, FeedChoices, QueryType, Post } from '../../constants';
import { getPostsByQuery } from '../../utils';

const UserPosts = () => {
    const { user, shownPosts, setShownPosts } = useContext(WebContext); 
    const userPosts = user !== null? [...shownPosts].filter((p) => user.all_epoch_keys.find(epk => epk === p.epoch_key) !== undefined) : shownPosts;
    const [feedChoices, setFeedChoices] = useState<FeedChoices>({
        query0: QueryType.popularity, 
        query1: QueryType.most, 
        query2: QueryType.votes, 
        query3: QueryType.today
    });

    const getPosts = async (lastRead: string = '0') => {
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

        let sortedPosts: Post[] = shownPosts;
        if (user !== null) {
            sortedPosts = (await getPostsByQuery(
                user === null? [] : user.epoch_keys, 
                feedChoices.query1,
                feedChoices.query0, 
                feedChoices.query2,
                start,
                end
            )).filter((p) => user.all_epoch_keys.find(epk => epk === p.epoch_key) !== undefined);
        }
    
        if (lastRead === '0') {
            setShownPosts(sortedPosts);
        } else {
            setShownPosts([...shownPosts, ...sortedPosts]);
        }
    }

    const getQueryPeriod = () => {
        if (feedChoices.query3 === QueryType.today) return 1;
        else if (feedChoices.query3 === QueryType.this_week) return 7;
        else if (feedChoices.query3 === QueryType.this_month) return 30;
        else if (feedChoices.query3 === QueryType.this_year) return 365;
        else return 100000000;
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
    }, [feedChoices]);

    return (
        <div className="user-page-main-content">
            <PostField page={Page.User} />
            <h3>My Posts</h3>
            <Feed feedChoices={feedChoices} setFeedChoices={setFeedChoices} />
            <div className="post-list"><PostsList posts={userPosts} timeFilter={feedChoices.query0 === QueryType.popularity? getQueryPeriod() : 100000000} loadMorePosts={loadMorePosts} /></div>
        </div>
    );
}

export default UserPosts;