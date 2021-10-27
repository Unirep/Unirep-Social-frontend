import { useState, useContext } from 'react';
import { History, ActionType } from '../../../constants';
import { WebContext } from '../../../context/WebContext';
import HistoryList from './historyList';
import './userHistory.scss';

type Props = {
    histories: History[]
}

const UserHistory = ({ histories }: Props) => {
    const { user } = useContext(WebContext);

    const getHistoryByEpoch = (epoch: number) => {
        /// actually will interact with server or contract ///
        return histories.filter(history => history.epoch === epoch);
    }

    return (
        <div className="user-page-main-content">
            {
                user !== null? 
                    (Array.from(Array(user.current_epoch + 1).keys())).reverse().map(i => {
                        const history = getHistoryByEpoch(i);
                        return history.length > 0? <HistoryList histories={getHistoryByEpoch(i)} key={i} /> : <div key={i}></div>
                    }) 
                    : <div></div>
            }
        </div>
    );
}

export default UserHistory;