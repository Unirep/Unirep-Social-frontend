import { useState, useContext, useEffect } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { vote, getUserState } from '../../utils';
import { WebContext } from '../../context/WebContext';
import { MainPageContext } from '../../context/MainPageContext';
import { Post, Vote, Comment, DataType, ChoiceType } from '../../constants';
import Dropdown from '../dropdown/dropdown';
import './voteBox.scss';

type Props = {
    isUpvote: boolean,
    data: Post|Comment,
    closeVote: () => void,
}
const VoteBox = ({ isUpvote, data, closeVote } : Props) => {

    const { user, setUser, shownPosts, setShownPosts, setIsLoading } = useContext(WebContext);
    const { setIsMainPageUpVoteBoxOn: setIsUpVoteBoxOn, setIsMainPageDownVoteBoxOn: setIsDownVoteBoxOn, setMainPageVoteReceiver: setVoteReceiver } = useContext(MainPageContext);
    const [ givenAmount, setGivenAmount ] = useState<number>(1);
    const [ epkNonce, setEpkNonce ] = useState(0); 
    const [ isDropdown, setIsDropdown ] = useState(false);
    const [ isBlockLoading, setIsBlockLoading ] = useState(false);
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

    // useEffect(() => {
    //     if (isBlockLoading) {
    //         const timer = setTimeout(() => {
    //             setPercentage(((percentage + 1) % 100) + 1);
    //         }, 100);

    //         return () => clearTimeout(timer);
    //     }
    // }, [percentage]);

    const init = () => {
        setIsDropdown(false);
        setIsLoading(false);
        setVoteReceiver(null);
        setIsUpVoteBoxOn(false);
        setIsDownVoteBoxOn(false);
    }

    const doVote = async () => {
        if (user === null) {
            console.error('user not login!');
        } else if (givenAmount === undefined) {
            console.error('no enter any given amount');
        } else {
            setIsLoading(true);
            setIsBlockLoading(true);
            // setPercentage(1);

            const isPost = data.type === DataType.Post;
            let ret: any;
            if (isUpvote) {
                ret = await vote(user.identity, givenAmount, 0, data.id, data.epoch_key, epkNonce, 0, isPost, user.spent, user.userState);
                console.log('upvote ret: ' + JSON.stringify(ret))
            } else {
                ret = await vote(user.identity, 0, givenAmount, data.id, data.epoch_key, epkNonce, 0, isPost, user.spent, user.userState);
                console.log('downvote ret: ' + JSON.stringify(ret))
            }

            const newVote: Vote = {
                upvote: isUpvote? givenAmount:0,
                downvote: isUpvote? 0:givenAmount,
                epoch_key: user.epoch_keys[epkNonce],
            }
            let v = [...data.votes, newVote];
            if (data.type === DataType.Post) {
                const filteredPosts = shownPosts.filter((p) => p.id != data.id)
                let p: Post = {...(data as Post), 
                    upvote: data.upvote + (isUpvote? givenAmount : 0),
                    downvote: data.downvote + (isUpvote? 0 : givenAmount), 
                    isUpvoted: isUpvote || data.isUpvoted, 
                    isDownvoted: !isUpvote || data.isDownvoted, 
                    votes: v
                };
                setShownPosts([p, ...filteredPosts]);
            } else if (data.type === DataType.Comment) {
                const selectedPost = shownPosts.find((p) => p.id === (data as Comment).post_id);
                if (selectedPost === undefined) {
                    console.error('no such post!?????');
                } else {
                    const filteredPosts = shownPosts.filter((p) => p.id !== (data as Comment).post_id);
                    const filteredComment = selectedPost.comments.filter((c) => c.id !== data.id);
                    let c: Comment = {...(data as Comment), 
                        upvote: data.upvote + (isUpvote? givenAmount : 0),
                        downvote: data.downvote + (isUpvote? 0 : givenAmount), 
                        isUpvoted: isUpvote || data.isUpvoted, 
                        isDownvoted: !isUpvote || data.isDownvoted, 
                        votes: v
                    };
                    let p: Post = {...selectedPost, comments: [c, ...filteredComment]}
                    setShownPosts([p, ...filteredPosts]);
                }
            }
            
            setUser({...user, spent: user.spent + givenAmount, userState: ret.userState});
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
                    <div className="submit">Yep, Let's do it.</div>
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
                {/* <h3>{user?.reputation} Points Available</h3>
                <div className="vote-margin"></div>
                <p>Enter an amount up to 10 to give to @{props.data.epoch_key}</p>
                <div className="vote-margin"></div>
                <input type="number" placeholder="max 10" onChange={handleUserInput} value={givenAmount} />
                <div className="vote-margin"></div>
                <div className="dropdown">
                    { user !== null? 
                        <Dropdown 
                            type={ChoiceType.Epk}
                            defaultChoice={user.epoch_keys[epkNonce]}
                            choices={user.epoch_keys}
                            onChoose={changeEpkNonce}
                            isDropdown={isDropdown}
                            setIsDropdown={setIsDropdown}
                        /> : <div></div>
                    }
                </div>
                <div className="vote-margin"></div>
                <div className="vote-button" onClick={doVote}>
                    {props.isUpvote? (<img src="/images/upvote-purple.png" />):(<img src="/images/downvote-purple.png" />)}
                    {props.isUpvote? (<p>Up Vote</p>):(<p>Down Vote</p>)}
                </div>
                {
                    isBlockLoading? <div className="loading-block">
                        <div style={{width: 75, height: 75}}>
                            <CircularProgressbar text="Loading..." value={percentage} styles={{
                                path: {
                                    transition: 'stroke-dashoffset 0.1s ease 0s',
                                }
                            }}/>
                        </div>
                    </div> : <div></div>
                } */}
                </div>
            </div>
        }
        </div>
    );
}

export default VoteBox;