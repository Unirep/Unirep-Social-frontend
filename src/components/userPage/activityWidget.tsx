import { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link'; 
import dateformat from 'dateformat';
import { Record, ActionType } from '../../constants';
import { WebContext } from '../../context/WebContext';
import { recordExpression } from '@babel/types';

type Props = {
    record: Record,
    isSpent: boolean,
}

type Info = {
    who: string,
    action: string,
}

type ActionData = {
    title: string, 
    content: string
}

const ActivityWidget = ({ record, isSpent }: Props) => {
    const [date, setDate] = useState<string>(dateformat(new Date(record.time), "dd/mm/yyyy hh:MM TT"));
    
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
    
    const [info, setInfo] = useState<Info>(() => translateInfo(record));
    const [goto, setGoto] = useState<string>(() => {
        if (record.data_id === '0') {
            return '/user';
        } else {
            const id = record.data_id.split('_');
            if (id.length > 1) {
                return `/post/${id[0]}#${id[1]}`;
            } else {
                return `/post/${id[0]}`;
            }
        }
    });
    const [actionData, setActionData] = useState<ActionData>(() => {
        if (record.content !== undefined && record.content.length > 0) {
            let tmp = record.content.split('<title>');
            return tmp.length > 1? {title: tmp[1], content: tmp[2]} : {title: '', content: tmp[0]};
        } else {
            return {title: '', content: ''};
        }
    })
    
    useEffect(() => {
        setInfo(translateInfo(record));
    }, [record])

    return (
        <Link className="link" to={goto}>
            <div className="activity-widget" >
                {
                    isSpent? 
                        <div className="side">
                            <div className="amount">{record.downvote + record.upvote}</div>
                            <div className="type">
                                <img src={record.action === ActionType.Vote? (record.upvote > 0? '/images/boost-grey.png' : '/images/squash-grey.png'): '/images/unirep-grey.png'} />
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
                        { record.content !== undefined && record.content.length > 0? 
                            actionData.title.length > 1 ?
                                <div className="data">
                                    <div className="title">{actionData.title}</div>   
                                    <div className="content">{actionData.content}</div>
                                </div> : 
                                <div className="data">
                                    <div className="content">{actionData.content}</div>
                                </div> :
                            <div></div>
                        }
                    </div>
                </div>
                {
                    isSpent? 
                        <div></div> :
                        <div className="side">
                            <div className="amount">{record.action === ActionType.Vote? (record.upvote > 0? '+' + record.upvote : '-' + record.downvote) : '+' + record.upvote}</div>
                            <div className="type">
                                <img src={record.action === ActionType.Vote? (record.upvote > 0? '/images/boost.svg' : '/images/squash.svg'): '/images/unirep.svg'} />
                                Received
                            </div>
                        </div>
                }
            </div>
        </Link>
    );
}

export default ActivityWidget;