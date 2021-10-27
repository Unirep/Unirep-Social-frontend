import React, { useState, useContext } from 'react';
import { WebContext } from '../../context/WebContext';
import * as Constants from '../../constants';
import { getEpochKeys, getUserState, getNextEpochTime, userStateTransition } from '../../utils';
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
        setErrorMsg('');
    }

    const closeBox = async () => {
        const userStateResult = await getUserState(userInput);
        
        if (userStateResult.hasSignedUp) {
            const currentRep = userStateResult.userState.getRepByAttester(userStateResult.attesterId);
            const epks = await getEpochKeys(userInput, userStateResult.currentEpoch);
            const userEpoch = userStateResult.userState.latestTransitionedEpoch;

            // if (userEpoch !== ret.currentEpoch) {
            //     console.log('user epoch is not the same as current epoch, do user state transition, ' + userEpoch + ' != ' + ret.currentEpoch);
            //     const retAfterUST = await userStateTransition(userInput);
            //     console.log(retAfterUST);

            //     const reputation = retAfterUST.userState.getRepByAttester(ret.attesterId);
            //     setUser({
            //         identity: userInput,
            //         epoch_keys: retAfterUST.epks,
            //         reputation: Number(reputation.posRep) - Number(reputation.negRep),
            //         current_epoch: retAfterUST.toEpoch,
            //     });
            // } else {
                const reputation = userStateResult.userState.getRepByAttester(userStateResult.attesterId);
                setUser({
                    identity: userInput,
                    epoch_keys: epks,
                    reputation: Number(reputation.posRep) - Number(reputation.negRep),
                    current_epoch: userStateResult.currentEpoch,
                    isConfirmed: true,
                    userState: userStateResult.userState,
                });
            // }

            setShownPosts([...shownPosts].map(p => {
                let isUpvoted: boolean = false, isDownvoted: boolean = false;
                p.votes.forEach(v => {
                    const e = epks.find(_e => _e === v.epoch_key);
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
                        const e = epks.find(_e => _e === v.epoch_key);
                        if (e !== undefined) {
                            if (v.upvote > 0) {
                                isUpvotedC = true;
                            }
                            if (v.downvote > 0) {
                                isDownvotedC = true;
                            }
                        }
                    });
                    let isAuthorC: boolean = epks.find(_e => _e === c.epoch_key) !== undefined;
                    let newComment: Constants.Comment = {...c, isUpvoted: isUpvotedC, isDownvoted: isDownvotedC, isAuthor: isAuthorC};
                    return newComment;
                });
                let isAuthor: boolean = epks.find(_e => _e === p.epoch_key) !== undefined;
                let newPost: Constants.Post = {...p, isUpvoted, isDownvoted, isAuthor, comments};
                return newPost;
            }));

            setPageStatus(Constants.PageStatus.None);

            const nextET = await getNextEpochTime();
            setNextUSTTime(nextET);
        } else {
            setErrorMsg('This identity hasn\'t signed up yet.')
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
                {errorMsg !== ''? 
                    <div className="sign-error-message">
                        <img src="/images/warning.png" />
                        <span>{errorMsg}</span>
                    </div> : <div className="margin-box"></div>
                }
                <div className="sign-button-purple" onClick={closeBox}>Confirm</div>
            </div>
        </div>
    );
}

export default SignUp;