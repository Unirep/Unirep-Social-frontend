import { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import dateformat from 'dateformat';
import { Record, ActionType } from '../../constants';
import { WebContext } from '../../context/WebContext';

type Props = {
    history: Record,
    isSpent: boolean,
}

type Info = {
    who: string,
    action: string,
}

const ActivityWidget = ({ history, isSpent }: Props) => {
    const { shownPosts } = useContext(WebContext);
    const [date, setDate] = useState<string>(dateformat(new Date(history.time), "dd/mm/yyyy hh:MM TT"));
    
    const translateInfo = (h: Record) => {
        if (h.action === ActionType.Post) {
            return {who: 'I (' + h.from + ')', action: 'created a post'}
        } else if (h.action === ActionType.Comment) {
            return {who: 'I (' + h.from + ')', action: 'commented on a post'}
        } else if (h.action === ActionType.UST) {
            return {who: 'UniRep Social', action: 'Epoch Rep drop'}
        } else if (h.action === ActionType.Signup) {
            return {who: 'Unirep Social', action: 'Sign Up Rep drop'}
        } else {
            if (isSpent) {
                return {who: 'I (' + h.from + ')', action: h.upvote > 0? 'boosted this post' : 'squashed this post'};
            } else {
                return {who: h.from, action: h.upvote > 0? 'boosted this post' : 'squashed this post'};
            }
        }
    }
    
    const [info, setInfo] = useState<Info>(() => translateInfo(history));
    const [data, setData] = useState(() => {
        if (history.data_id === '0') {
            return null;
        }

        const id = history.data_id.split('_');
        if (id.length > 1) { // is on a comment
            const p = shownPosts.find(post => post.id === id[0]);
            if (p !== undefined) {
                return p.comments.find(c => c.id === id[1]);
            } else {
                return undefined;
            }
        } else {
            return shownPosts.find(post => post.id === id[0]);
        }
    });

    

    useEffect(() => {
        setInfo(translateInfo(history));
    }, [history])

    const routerHistory = useHistory();

    const gotoDataPage = () => {
        if (history.data_id === '0') {
            return;
        }

        const id = history.data_id.split('_');
        if (id.length > 1) {
            routerHistory.push(`/post/${id[0]}`, {commentId: id[1]});
        } else {
            routerHistory.push(`/post/${id[0]}`, {commentId: ''});
        }
    }

    return (
        <div className="activity-widget" onClick={gotoDataPage}>
            {
                isSpent? 
                    <div className="side">
                        <div className="amount">{history.downvote + history.upvote}</div>
                        <div className="type">
                            <img src={history.action === ActionType.Vote? (history.upvote > 0? '/images/boost-grey.png' : '/images/squash-grey.png'): '/images/unirep-grey.png'} />
                            Used
                        </div>
                    </div> : <div></div>
            }
            <div className="main">
                <div className="header">
                    <p>{date}</p>
                    <div className="etherscan">Etherscan <img src="/images/etherscan.png" /></div>
                </div>
                <div className="main-info">
                    <div className="who">
                        {info.who} <img src="/images/lighting.svg" /> {info.action}
                    </div>
                    { data !== null && data !== undefined? 
                        <div className="data">
                            { 'title' in data? <div className="title">{data.title}</div> : <div></div>}    
                            <div className="content">{data.content}</div>
                        </div> : <div></div>
                    }
                </div>
            </div>
            {
                isSpent? 
                    <div></div> :
                    <div className="side">
                        <div className="amount">{history.action === ActionType.Vote? (history.upvote > 0? '+' + history.upvote : '-' + history.downvote) : '+' + history.upvote}</div>
                        <div className="type">
                            <img src={history.action === ActionType.Vote? (history.upvote > 0? '/images/boost.svg' : '/images/squash.svg'): '/images/unirep.svg'} />
                            Received
                        </div>
                    </div>
            }
        </div>
    );
}

export default ActivityWidget;