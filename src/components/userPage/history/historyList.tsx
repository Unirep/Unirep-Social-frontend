import { useState, useContext } from 'react';
import { History, ActionType } from '../../../constants';
import { WebContext } from '../../../context/WebContext';
import HistoryWidget from './history';

type Props = {
    histories: History[],
    netGain: number,
    score: number
}

const HistoryList = ({ histories, netGain, score }: Props) => {
    const { user } = useContext(WebContext);
    const [expanded, setExpanded] = useState(false);

    const switchExpansion = () => {
        setExpanded(!expanded);
    }

    return (
        <div className="epoch-history">
            <div className="epoch-history-white">
                <div className="epoch-info" onClick={switchExpansion}>
                    <div className="info">
                        <label>Epoch</label>
                        <span>{histories[0].epoch}</span>
                    </div>
                    <div className="info">
                        <label>Score</label>
                        <span>{score}</span>
                    </div>
                    <div className="info">
                        <label>Net Gain</label>
                        <span><img src={netGain > 0? "/images/upvote-purple.png":"/images/downvote.png"}/>{Math.abs(netGain)}</span>
                    </div>
                    <div className="arrow">
                        <img src={expanded? "/images/arrow-up.png" : "/images/arrow-down.png"}/>
                    </div>
                </div>
                { expanded? 
                    <div>
                        <div className="divider"></div>
                        <div className="list-title">Received</div>
                        { histories.map((history, i) => <HistoryWidget history={history} key={i}/>)}
                    </div> : <div></div>}
            </div>
        </div>
    );
}

export default HistoryList;