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
    const [ strokeOffset, setStrokeOffset ] = useState<number>(225);
    const [ mouseDownPos, setMouseDownPos] = useState<number[]>([]);

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

    const handleUserInput = (event: any) => {
        if (event.target.value === '' || (event.target.value <= 10 && event.target.value >= 1)) {
            setGivenAmount(Number(event.target.value));
        }
    }

    const changeEpkNonce = (value: number) => {
        setEpkNonce(value);
        setIsDropdown(false);
    }

    const close = (event: any) => {
        preventClose(event);
        closeVote();
    }

    const setInitialPos = (event: any) => {
        let origin = document.querySelector('#origin');
        if (origin !== null) {
            let rect = origin.getBoundingClientRect();
            const originX = Math.floor(rect.left);
            const originY = Math.floor(rect.top);
            setMouseDownPos([originX, originY, event.clientX, event.clientY]);
        }
    }

    const clearInitialPos = () => {
        setMouseDownPos([]);
    }

    const calcAngle = (event: any) => {
        if (mouseDownPos.length > 0) {
            const x_a = mouseDownPos[2] - mouseDownPos[0];
            const y_a = mouseDownPos[3] - mouseDownPos[1];
            const x_b = event.clientX - mouseDownPos[0];
            const y_b = event.clientY - mouseDownPos[1];
            const x_a_sqr = x_a * x_a;
            const y_a_sqr = y_a * y_a;
            const x_b_sqr = x_b * x_b;
            const y_b_sqr = y_b * y_b;
            
            const cos = ((x_a * x_b) + (y_a * y_b)) / (Math.sqrt(x_a_sqr + y_a_sqr) * Math.sqrt(x_b_sqr + y_b_sqr));
            // console.log(cos);

            if (cos <= 0.9) {
                setMouseDownPos([mouseDownPos[0], mouseDownPos[1], event.clientX, event.clientY]);
                const det = x_a * y_b - x_b * y_a;
                const newAmount = det > 0? Math.min(givenAmount + 1, 10) : Math.max(givenAmount - 1, 1);
                setGivenAmount(newAmount);
                setStrokeOffset(250 - newAmount * 25);
            }
        }
    }

    return (
        <div className="vote-overlay" onClick={close}>
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
                    <div className="dashboard" onMouseDown={setInitialPos} onMouseUp={clearInitialPos} onMouseMove={calcAngle}>
                        <div id="origin"></div>
                        <div className="amount">{givenAmount}</div>
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" id="svg-bar">
                            <path className="grey" d="M 16 96 A 56 56 0 1 1 112 96" />
                            <path className="black" d="M 16 96 A 56 56 0 1 1 112 96" style={{strokeDashoffset: strokeOffset}} />
                        </svg>
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" id="svg-index" style={{transform: `rotate(${givenAmount * 25}deg)`}}>
                            <path id="index" d="M 20 76 A 45 45 0 1 1 92 76" />
                            <text>
                                <textPath href="#index">|</textPath>
                            </text>
                        </svg>
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
    );
}

export default VoteBox;