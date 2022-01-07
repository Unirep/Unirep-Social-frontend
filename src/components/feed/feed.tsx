import { useState, useContext } from 'react';
import { WebContext } from '../../context/WebContext';
import { MainPageContext } from '../../context/MainPageContext';
import Dropdown from '../dropdown/dropdown';
import { QueryType } from '../../constants';
import { getPostsByQuery } from '../../utils';
import './feed.scss';

type choiceProps = {
    type: QueryType,
    isChosen: boolean,
    setFeedChoice: (query: QueryType) => void
}

const FeedChoice = ({type, isChosen, setFeedChoice}: choiceProps) => {
    return (
        <div className={isChosen? "feed-choice chosen" : "feed-choice"} onClick={() => setFeedChoice(type)}>
            <img src={`/images/${type}${isChosen? '-fill': ''}.svg`} />
            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        </div>
    );
}

type Props = {
    feedChoice: QueryType,
    setFeedChoice: (query: QueryType) => void,
}

const Feed = ({feedChoice, setFeedChoice}: Props) => {
    return (
        <div className="feed-row">
            <FeedChoice type={QueryType.New} isChosen={feedChoice === QueryType.New} setFeedChoice={setFeedChoice} />
            <div className="divider"></div>
            <FeedChoice type={QueryType.Boost} isChosen={feedChoice === QueryType.Boost} setFeedChoice={setFeedChoice} />
            <div className="divider"></div>
            <FeedChoice type={QueryType.Comments} isChosen={feedChoice === QueryType.Comments} setFeedChoice={setFeedChoice} />
            <div className="divider"></div>
            <FeedChoice type={QueryType.Squash} isChosen={feedChoice === QueryType.Squash} setFeedChoice={setFeedChoice} />
        </div>
    );
}

export default Feed;