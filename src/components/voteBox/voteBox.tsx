import { useState, useContext } from 'react';
import { vote, getUserState } from '../../utils';
import { WebContext } from '../../context/WebContext';
import { MainPageContext } from '../../context/MainPageContext';
import { Post, Vote, Comment, DataType, ChoiceType } from '../../constants';
import Dropdown from '../dropdown/dropdown';
import './voteBox.scss';

type Props = {
    isUpvote: boolean,
    data: Post|Comment,
}
const VoteBox = (props: Props) => {

    const { user, setUser, shownPosts, setShownPosts, setIsLoading } = useContext(WebContext);
    const { setIsMainPageUpVoteBoxOn: setIsUpVoteBoxOn, setIsMainPageDownVoteBoxOn: setIsDownVoteBoxOn, setMainPageVoteReceiver: setVoteReceiver } = useContext(MainPageContext);
    const [ givenAmount, setGivenAmount ] = useState<undefined|number>(1);
    const [ epkNonce, setEpkNonce ] = useState(0); 
    const [ isDropdown, setIsDropdown ] = useState(false);
    const [ isBlockLoading, setIsBlockLoading ] = useState(false);

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

            let ret: any;
            if (props.isUpvote) {
                ret = await vote(user.identity, givenAmount, 0, props.data.id, props.data.epoch_key, epkNonce, 0, false);
                console.log('upvote ret: ' + JSON.stringify(ret))
            } else {
                ret = await vote(user.identity, 0, givenAmount, props.data.id, props.data.epoch_key, epkNonce, 0, false);
                console.log('downvote ret: ' + JSON.stringify(ret))
            }

            const newVote: Vote = {
                upvote: props.isUpvote? givenAmount:0,
                downvote: props.isUpvote? 0:givenAmount,
                epoch_key: user.epoch_keys[epkNonce],
            }
            let v = [...props.data.votes, newVote];
            if (props.data.type === DataType.Post) {
                const filteredPosts = shownPosts.filter((p) => p.id != props.data.id)
                let p: Post = {...(props.data as Post), 
                    upvote: props.data.upvote + (props.isUpvote? givenAmount : 0),
                    downvote: props.data.downvote + (props.isUpvote? 0 : givenAmount), 
                    isUpvoted: props.isUpvote || props.data.isUpvoted, 
                    isDownvoted: !props.isUpvote || props.data.isDownvoted, 
                    votes: v
                };
                setShownPosts([p, ...filteredPosts]);
            } else if (props.data.type === DataType.Comment) {
                const selectedPost = shownPosts.find((p) => p.id === (props.data as Comment).post_id);
                if (selectedPost === undefined) {
                    console.error('no such post!?????');
                } else {
                    const filteredPosts = shownPosts.filter((p) => p.id !== (props.data as Comment).post_id);
                    const filteredComment = selectedPost.comments.filter((c) => c.id !== props.data.id);
                    let c: Comment = {...(props.data as Comment), 
                        upvote: props.data.upvote + (props.isUpvote? givenAmount : 0),
                        downvote: props.data.downvote + (props.isUpvote? 0 : givenAmount), 
                        isUpvoted: props.isUpvote || props.data.isUpvoted, 
                        isDownvoted: !props.isUpvote || props.data.isDownvoted, 
                        votes: v
                    };
                    let p: Post = {...selectedPost, comments: [c, ...filteredComment]}
                    setShownPosts([p, ...filteredPosts]);
                }
            }
            
            const reputations = (await getUserState(user.identity)).userState.getRep();
            setUser({...user, reputation: reputations});
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

    return (
        <div className="vote-overlay">
            <div className="vote-box" onClick={preventClose}>
                <h3>{user?.reputation} Points Available</h3>
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
                { isBlockLoading? <div className="loading-block">Loading...</div> : <div></div>}
            </div>
        </div>
    );
}

export default VoteBox;