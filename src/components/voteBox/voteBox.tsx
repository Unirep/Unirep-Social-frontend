import { useState, useContext } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { WebContext } from '../../context/WebContext';
import { Post, Vote, Comment, DataType, ActionType } from '../../constants';
import './voteBox.scss';

type Props = {
    isUpvote: boolean,
    data: Post|Comment,
    closeVote: () => void,
}
const VoteBox = ({ isUpvote, data, closeVote } : Props) => {

    const { user, setAction } = useContext(WebContext);
    const [ givenAmount, setGivenAmount ] = useState<number>(1);
    const [ epkNonce, setEpkNonce ] = useState(0); 
    const [ isHistoriesOpen, setHistoriesOpen ] = useState(false);
    const [ voteHistories, setVoteHistories ] = useState(() => {
        if (data.votes.length === 0) {
            return [];
        } else {
            if (user !== null) {
                let ret: Vote[] = [];
                for (var i = 0; i < data.votes.length; i ++) {
                    if (isUpvote && data.votes[i].upvote > 0 || !isUpvote && data.votes[i].downvote > 0) {
                        const e = user.epoch_keys.find(_e => _e === data.votes[i].epoch_key);
                        if (e !== null) {
                            ret = [...ret, data.votes[i]];
                        
                        }
                    } 
                }
                return ret;
            } else {
                return [];
            }
        }
    });

    const init = () => {
        // setIsLoading(false);
        closeVote();
    }

    const doVote = async () => {
        if (user === null) {
            console.error('user not login!');
        } else if (givenAmount === undefined) {
            console.error('no enter any given amount');
        } else {
            const isPost = data.type === DataType.Post;
            let actionData: any
            if (isPost) {
                actionData = {
                    identity: user.identity,
                    upvote: isUpvote? givenAmount : 0,
                    downvote: isUpvote? 0 : givenAmount,
                    data: data.id,
                    epk: data.epoch_key,
                    epkNonce,
                    isPost,
                    spent: user.spent,
                    userState: user.userState,
                };
            } else {
                const tmp = data as Comment;
                actionData = {
                    identity: user.identity,
                    upvote: isUpvote? givenAmount : 0,
                    downvote: isUpvote? 0 : givenAmount,
                    data: tmp.post_id + '_' + tmp.id,
                    epk: tmp.epoch_key,
                    epkNonce,
                    isPost,
                    spent: user.spent,
                    userState: user.userState,
                };
            }
            
            setAction({action: ActionType.Vote, data: actionData});
            init();
        }
    }

    const preventClose = (event: any) => {
        event.stopPropagation();
    }

    const changeGivenAmount = (event: any) => {
        if (event.target.value === '' || (event.target.value <= 10 && event.target.value >= 1)) {
            setGivenAmount(Number(event.target.value));
        }
    }

    const close = (event: any) => {
        preventClose(event);
        closeVote();
    }

    return (
        <div>
        {
            user === null? <div></div> : <div className="vote-overlay" onClick={close}>
            <div className="vote-box" onClick={preventClose}>
                <div className="grey-box">
                    <div className="close">
                        <img src="/images/close-white.svg" onClick={close} />
                    </div>
                    <div className="title">
                        <img src={`/images/${isUpvote? 'boost':'squash'}-fill.svg`} />
                        {isUpvote? "Boost":"Squash"}
                    </div>
                    <div className="description">
                        Tune up the amount of Rep to {isUpvote? 'boost' : 'squash'} this post
                    </div>
                    <div className="counter">
                        <input type="number" min="1" max="10" step="1" value={givenAmount} onChange={changeGivenAmount} />
                        <div className="counter-btns">
                            <div className="counter-btn add" onClick={() => {setGivenAmount(givenAmount < 10? givenAmount + 1 : givenAmount)}}>
                                <img src="/images/arrow-up.svg" />
                            </div>
                            <div className="counter-btn minus" onClick={() => {setGivenAmount(givenAmount > 1? givenAmount - 1 : givenAmount)}}>
                            <img src="/images/arrow-down.svg" />
                            </div>
                        </div>
                    </div>
                    <div className="epks">
                        { user.epoch_keys.map((key, i) => 
                            <div className={epkNonce === i? "epk chosen" : "epk"} key={key} onClick={() => setEpkNonce(i)}>{key}</div>
                        ) }
                    </div>
                </div>
                <div className="white-box">
                    <div className="submit" onClick={doVote}>Yep, let's do it.</div>
                    <div className="histories">
                        <div className="main-btn" onClick={() => setHistoriesOpen(!isHistoriesOpen)}>
                            <div className="btn-name">
                                <p className="title">History</p>
                                <p className="description">{`You have ${voteHistories.length > 0? '' : 'not '}${isUpvote? 'boosted':'squashed'} this before`}</p>
                            </div>
                            <img src={`/images/arrow-tri-${isHistoriesOpen? 'up':'down'}.svg`} />
                        </div>
                        { isHistoriesOpen? 
                            <div className="histories-list">
                                { voteHistories.map((h, i) => 
                                    <div className="record" key={i}>
                                        <div className="record-epk">{h.epoch_key}</div>
                                        <span>{isUpvote? h.upvote : h.downvote}</span>
                                        <img src={`/images/${isUpvote? 'boost' : 'squash'}-fill.svg`}/>
                                    </div>
                                )}
                            </div> : <div></div>}
                        </div>
                    </div>
                </div>
            </div>
        }
        </div>
    );
}

export default VoteBox;