import { useState, useContext } from 'react';
import { WebContext } from '../../context/WebContext';
import { MainPageContext } from '../../context/MainPageContext';
import Dropdown from '../dropdown/dropdown';
import { ChoiceType, Post, getDaysByString, diffDays, QueryType } from '../../constants';
import { getPostsByQuery } from '../../utils';
import './feed.scss';

const popularChoices = [
    [QueryType.most, QueryType.fewest],
    [QueryType.comments, QueryType.reputation, QueryType.votes, QueryType.upvotes],
    ['today', 'this week', 'this month', 'this year', 'all time']
];

const timeChoices = [
    [QueryType.newest, QueryType.oldest],
    [QueryType.comments, QueryType.posts]
];

const Feed = () => {
    
    const { shownPosts, setShownPosts, user } = useContext(WebContext);
    const { setPostTimeFilter } = useContext(MainPageContext);

    const [isTime, setIsTime] = useState(false);
    const [popularFeed, setPopularFeed] = useState([0, 2, 0]);
    const [timeFeed, setTimeFeed] = useState([0, 1]);

    const onToggleSwitch = (event: any) => {
        if (event.target.checked === true) {
            setIsTime(true);
        } else {
            setIsTime(false);
        }
    }

    const sort = async (feed: any) => {
        const end = Date.now();
        let start: number = 0;
        if (!isTime) {
            if (feed[2] === 0) { // today
                start = end - 24 * 60 * 60 * 1000;
            } else if (feed[2] === 1) { // this week
                start = end - 7 * 24 * 60 * 60 * 1000;
            } else if (feed[2] === 2) { // this month
                start = end - 30 * 24 * 60 * 60 * 1000;
            } else if (feed[2] === 3) { // this year
                start = end - 365 * 24 * 60 * 60 * 1000;
            } else if (feed[2] === 4) { // all time
                start = 0;
            }
        }
        const sortedPosts = await getPostsByQuery(
            user === null? [] : user.epoch_keys, 
            isTime? timeChoices[0][feed[0]] : popularChoices[0][feed[0]],
            isTime? QueryType.time : QueryType.popularity, 
            isTime? timeChoices[1][feed[1]] : popularChoices[1][feed[1]],
            start,
            end
        );
        // if (isTime) { /// sort by time
        //     if (feed[1] === 1) { /// sort by posts
        //         if (feed[0] == 0) {
        //             sortedPosts = [...shownPosts].sort((a, b) => a.post_time > b.post_time? -1 : 1);
        //         } else {
        //             sortedPosts = [...shownPosts].sort((a, b) => a.post_time < b.post_time? -1 : 1);
        //         }
        //     } else { /// sort by comments
        //         if (feed[0] === 0) {
        //             sortedPosts = [...shownPosts].sort((a, b) => 
        //                 (a.comments.length > 0? a.comments[0].post_time:a.post_time) > 
        //                 (b.comments.length > 0? b.comments[0].post_time:b.post_time)? -1 : 1);
        //         } else {
        //             sortedPosts = [...shownPosts].sort((a, b) => 
        //                 (a.comments.length > 0? a.comments[0].post_time:a.post_time) < 
        //                 (b.comments.length > 0? b.comments[0].post_time:b.post_time)? -1 : 1);
        //         }
        //     }
        // } else { /// sort by popularity
        //     // get posts in right time, then sort that part, then sort the remaining according to time
        //     const restrictDays = getDaysByString(popularChoices[2][feed[2]]) as number;
        //     setPostTimeFilter(restrictDays);
        //     const today = Date.now();
        //     const filteredPosts = shownPosts.filter((p) => diffDays(today, p.post_time) <= restrictDays);
        //     const otherPosts = shownPosts.filter((p) => diffDays(today, p.post_time) > restrictDays);
        //     otherPosts.sort((a, b) => a.post_time > b.post_time? -1 : 1);

        //     if (feed[1] === 0) { /// sort by comments count
        //         if (feed[0] === 0) {
        //             filteredPosts.sort((a, b) => a.comments.length > b.comments.length? -1 : 1);
        //         } else {
        //             filteredPosts.sort((a, b) => a.comments.length < b.comments.length? -1 : 1);
        //         }
        //     } else if (feed[1] === 1) { /// sort by rep
        //         if (feed[0] === 0) {
        //             filteredPosts.sort((a, b) => a.reputation > b.reputation? -1 : 1);
        //         } else {
        //             filteredPosts.sort((a, b) => a.reputation < b.reputation? -1 : 1);
        //         }
        //     } else if (feed[1] === 2) { /// sort by vote count
        //         if (feed[0] === 0) {
        //             filteredPosts.sort((a, b) => a.votes.length > b.votes.length? -1 : 1);
        //         } else {
        //             filteredPosts.sort((a, b) => a.votes.length < b.votes.length? -1 : 1);
        //         }
        //     } else { /// sort by up vote
        //         if (feed[0] === 0) {
        //             filteredPosts.sort((a, b) => a.upvote > b.upvote? -1 : 1);
        //         } else {                
        //             filteredPosts.sort((a, b) => a.upvote < b.upvote? -1 : 1);
        //         }
        //     }

        //     sortedPosts = [...filteredPosts, ...otherPosts];
        // }
        setShownPosts(sortedPosts);
    }

    const onTapPopularFeed = (rowIndex: number, chosenIndex: number) => {
        const newPopularFeed = [...popularFeed].map((originalIndex, n) => n === rowIndex? chosenIndex : originalIndex);
        setPopularFeed(newPopularFeed);
        sort(newPopularFeed);
    }

    const onTapTimeFeed = (rowIndex: number, chosenIndex: number) => {
        const newTimeFeed = [...timeFeed].map((originalIndex, n) => n === rowIndex? chosenIndex : originalIndex);
        setTimeFeed(newTimeFeed);
        sort(newTimeFeed);
    }

    return (
        <div>
            {/* Popular */}
            <div className="feed-row">
                <div className="toggle-switch">
                    <label className="switch">
                        <input type="checkbox" defaultChecked={isTime} onChange={onToggleSwitch}/>
                        <span className="slider round"></span>
                        <img className="diamond" src="/images/diamond.png" />
                        <img className="clock" src="/images/clock.png" />
                    </label>
                </div>
                { isTime? 
                    <div className="dropdown-row">
                        {timeChoices.map((choices, index) => 
                            <div className="dropdown-box" key={'timeFeed' + index}>
                                <Dropdown 
                                    choices={choices} 
                                    type={ChoiceType.Feed}  
                                    onChoose={(value) => onTapTimeFeed(index, value)}
                                    defaultChoice={timeChoices[index][timeFeed[index]]}
                                    isDropdown={false}
                                    setIsDropdown={() => {}}
                                />
                            </div>
                        )}
                    </div>: 
                    <div className="dropdown-row">
                        {popularChoices.map((choices, index) => 
                            <div className="dropdown-box" key={'popularFeed' + index}>
                                <Dropdown 
                                    choices={choices} 
                                    type={ChoiceType.Feed}  
                                    onChoose={(value) => onTapPopularFeed(index, value)}
                                    defaultChoice={popularChoices[index][popularFeed[index]]}
                                    isDropdown={false}
                                    setIsDropdown={() => {}}
                                />
                            </div>
                        )}
                    </div>
                }
            </div>
        </div>
    );
}

export default Feed;