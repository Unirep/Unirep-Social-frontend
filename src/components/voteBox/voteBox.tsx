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
    const [ givenAmount, setGivenAmount ] = useState<undefined|number>(1);
    const [ epkNonce, setEpkNonce ] = useState(0); 
    const [ isDropdown, setIsDropdown ] = useState(false);
    const [ isBlockLoading, setIsBlockLoading ] = useState(false);
    const [percentage, setPercentage] = useState<number>(0);

    useEffect(() => {
        if (isBlockLoading) {
            const timer = setTimeout(() => {
                setPercentage(((percentage + 1) % 100) + 1);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [percentage]);

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
            setPercentage(1);

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