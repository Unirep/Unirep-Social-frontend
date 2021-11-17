import { useState, useContext } from 'react';
import { WebContext } from '../../context/WebContext';
import { MainPageContext } from '../../context/MainPageContext';
import Dropdown from '../dropdown/dropdown';
import { ChoiceType, QueryType, FeedChoices } from '../../constants';
import { getPostsByQuery } from '../../utils';
import './feed.scss';

const popularChoices = [
    [QueryType.most, QueryType.fewest],
    [QueryType.comments, QueryType.reputation, QueryType.votes, QueryType.upvotes],
    [QueryType.today, QueryType.this_week, QueryType.this_month, QueryType.this_year, QueryType.all_time]
];

const timeChoices = [
    [QueryType.newest, QueryType.oldest],
    [QueryType.comments, QueryType.posts]
];

type Props = {
    feedChoices: FeedChoices,
    setFeedChoices: (input: FeedChoices) => void,
}

const Feed = ({feedChoices, setFeedChoices}: Props) => {
    
    // const { shownPosts, setShownPosts, user } = useContext(WebContext);
    // const { setPostTimeFilter } = useContext(MainPageContext);

    const [isTime, setIsTime] = useState(false);
    const [popularFeed, setPopularFeed] = useState([0, 2, 0]);
    const [timeFeed, setTimeFeed] = useState([0, 1]);

    const onToggleSwitch = (event: any) => {
        if (event.target.checked === true) {
            setFeedChoices({
                ...feedChoices, // not changing query3 since no period
                query0: QueryType.time,
                query1: QueryType.newest,
                query2: QueryType.posts,
            });
            setIsTime(true);
        } else {
            setFeedChoices({
                query0: QueryType.popularity,
                query1: QueryType.most,
                query2: QueryType.votes,
                query3: QueryType.today,
            });
            setIsTime(false);
        }
    }

    const onChangeFeed = async (feed: any) => {
        if (feedChoices.query0 === QueryType.popularity) {
            setFeedChoices({
                query0: QueryType.popularity,
                query1: popularChoices[0][feed[0]],
                query2: popularChoices[1][feed[1]],
                query3: popularChoices[2][feed[2]],
            });
        } else if (feedChoices.query0 === QueryType.time) {
            setFeedChoices({
                ...feedChoices, // not changing query3 since no period
                query0: QueryType.time,
                query1: timeChoices[0][feed[0]],
                query2: timeChoices[1][feed[1]],
            });
        }
    }

    const onTapPopularFeed = (rowIndex: number, chosenIndex: number) => {
        const newPopularFeed = [...popularFeed].map((originalIndex, n) => n === rowIndex? chosenIndex : originalIndex);
        setPopularFeed(newPopularFeed);
        onChangeFeed(newPopularFeed);
    }

    const onTapTimeFeed = (rowIndex: number, chosenIndex: number) => {
        const newTimeFeed = [...timeFeed].map((originalIndex, n) => n === rowIndex? chosenIndex : originalIndex);
        setTimeFeed(newTimeFeed);
        onChangeFeed(newTimeFeed);
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