import React, { useState, useContext } from 'react';
import { WebContext } from '../../context/WebContext';
import * as Constants from '../../constants';
import { userSignIn, getEpochKeys, getUserState, getNextEpochTime, userStateTransition } from '../../utils';
import './overlay.scss';

const SignUp = () => {
    const { setUser, setPageStatus, shownPosts, setShownPosts, setNextUSTTime } = useContext(WebContext);
    
    const [userInput, setUserInput] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    const preventCloseBox = (event: any) => {
        event.stopPropagation();
    }

    const handleUserInput = (event: any) => {
        event.stopPropagation();
        setUserInput(event.target.value);
        console.log('user input: ' + userInput);
    }

    const closeBox = async () => {
        const ret = await userSignIn(userInput);
        
        if (ret) {
            const ret = await getEpochKeys(userInput);
            const userState = ret.userState;
            const reputations = userState.getRep();
            const userEpoch = userState.latestTransitionedEpoch;

            if (userEpoch !== ret.currentEpoch) {
                console.log('user epoch is not the same as current epoch, do user state transition, ' + userEpoch + ' != ' + ret.currentEpoch);
                const ret1 = await userStateTransition(userInput);
                console.log(ret1);
            }

            setUser({
                identity: userInput,
                epoch_keys: ret.epks,
                reputation: reputations,
                current_epoch: ret.currentEpoch,
            });

            setShownPosts([...shownPosts].map(p => {
                let isUpvoted: boolean = false, isDownvoted: boolean = false;
                p.votes.forEach(v => {
                    const e = ret.epks.find(_e => _e === v.epoch_key);
                    if (e !== undefined) {
                        if (v.upvote > 0) {
                            isUpvoted = true;
                        }
                        if (v.downvote > 0) {
                            isDownvoted = true;
                        }
                    }
                });
                let comments = [...p.comments].map(c => {
                    let isUpvotedC: boolean = false, isDownvotedC: boolean = false;
                    c.votes.forEach(v => {
                        const e = ret.epks.find(_e => _e === v.epoch_key);
                        if (e !== undefined) {
                            if (v.upvote > 0) {
                                isUpvotedC = true;
                            }
                            if (v.downvote > 0) {
                                isDownvotedC = true;
                            }
                        }
                    });
                    let isAuthorC: boolean = ret.epks.find(_e => _e === c.epoch_key) !== undefined;
                    let newComment: Constants.Comment = {...c, isUpvoted: isUpvotedC, isDownvoted: isDownvotedC, isAuthor: isAuthorC};
                    return newComment;
                });
                let isAuthor: boolean = ret.epks.find(_e => _e === p.epoch_key) !== undefined;
                let newPost: Constants.Post = {...p, isUpvoted, isDownvoted, isAuthor, comments};
                return newPost;
            }));

            setPageStatus(Constants.PageStatus.None);

            const nextET = await getNextEpochTime();
            setNextUSTTime(nextET);
        } else {
            console.log(ret);
        }
        
    }

    return (
        <div className="signBox" onClick={preventCloseBox}>
            <div className="sign-title">
                <h3>Sign In With Private Key</h3> 
            </div>
            <div className="sign-message">
                Enter your private key to sign back in.
            </div>
            <div className="sign-confirm">
                <div className="sign-private-key">
                    <textarea name="userInput" placeholder="enter your private key" onChange={handleUserInput} />
                </div>
                <div className="margin-box"></div>
                <div className="sign-button-purple" onClick={closeBox}>Confirm</div>
            </div>
        </div>
    );
}

export default SignUp;