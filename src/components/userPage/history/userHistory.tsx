import { useState, useContext } from 'react';
import { History } from '../../../constants';
import { WebContext } from '../../../context/WebContext';
import HistoryList from './historyList';
import './userHistory.scss';

type Props = {
    histories: History[]
}

const UserHistory = ({ histories }: Props) => {
    const { user } = useContext(WebContext);

    let score: number = 0;

    const getHistoryByEpoch = (epoch: number) => {
        /// actually will interact with server or contract ///
        return histories.filter(history => history.epoch === epoch);
    }

    return (
        <div className="user-page-main-content">
            {
                user !== null? 
                    (Array.from(Array(user.current_epoch).keys())).map(i => {
                        const history = getHistoryByEpoch(i);
                        let netGain: number = 0;
                        history.forEach(h => netGain = netGain + h.upvote - h.downvote);
                        score = score + netGain;
                        return history.length > 0? <HistoryList histories={getHistoryByEpoch(i)} netGain={netGain} score={score} key={i} /> : <div key={i}></div>
                    }).reverse() 
                    : <div></div>
            }
        </div>
    );
}

export default UserHistory;