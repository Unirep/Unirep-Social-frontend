import React, { useState, useContext, useEffect } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { WebContext } from '../../context/WebContext';
import * as Constants from '../../constants';
import { getEpochKeys, getUserState, getNextEpochTime, userStateTransition, hasSignedUp, getEpochSpent, getAirdrop } from '../../utils';
import './overlay.scss';

const SignUp = () => {
    const { user, setUser, setPageStatus, shownPosts, setShownPosts, setNextUSTTime, setIsLoading, isLoading } = useContext(WebContext);
    
    const [userInput, setUserInput] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [percentage, setPercentage] = useState<number>(0);

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setPercentage(((percentage + 1) % 100) + 1);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [percentage]);

    const preventCloseBox = (event: any) => {
        event.stopPropagation();
    }

    const handleUserInput = (event: any) => {
        event.stopPropagation();
        setUserInput(event.target.value);
        setErrorMsg('');
    }

    const closeBox = async () => {
        setIsLoading(true);
        setPercentage(1);

        const userSignUpResult = await hasSignedUp(userInput);
        
        if(userSignUpResult === undefined) {
            setErrorMsg('Incorrect Identity format.')
        } else if (userSignUpResult.hasSignedUp) {
            const userStateResult = await getUserState(userInput, user?.userState);
            const userEpoch = userStateResult.userState.latestTransitionedEpoch;
            let userState: any = userStateResult.userState;

            if (userEpoch !== userStateResult.currentEpoch) {
                console.log('user epoch is not the same as current epoch, do user state transition, ' + userEpoch + ' != ' + userStateResult.currentEpoch);
                const retBeforeUST = await userStateTransition(userInput, userState.toJSON());
                const retAfterUST = await getUserState(userInput, retBeforeUST.userState.toJSON(), true)

                userState = retAfterUST.userState;
            } 
            try {
                console.log('get airdrop')
                await getAirdrop(userInput, userState.toJSON());
                const next = await getNextEpochTime();
                setNextUSTTime(next);
            } catch (e) {
                console.log('airdrop error: ', e)
            }
            
            const reputation = userState.getRepByAttester(userStateResult.attesterId);
            console.log('has signed up flag', reputation.signUp)
            // if(reputation.signUp === BigInt(0)) {
            //     await signUpUnirepUser(userInput, userStateResult.userState)
            //     console.log('rep will be airdrop next epoch')
            // }
            const epks = await getEpochKeys(userInput, userStateResult.currentEpoch);
            const spent = await getEpochSpent(epks);

            let allEpks: string[] = [...epks];
            for (var i = userStateResult.currentEpoch; i > 0; i --) {
                const oldEpks = await getEpochKeys(userInput, i);
                allEpks = [...allEpks, ...oldEpks];
            }
            setUser({
                identity: userInput,
                epoch_keys: epks,
                all_epoch_keys: allEpks,
                reputation: Number(reputation.posRep) - Number(reputation.negRep),
                current_epoch: userStateResult.currentEpoch,
                isConfirmed: true,
                spent: spent,
                userState: userState.toJSON(),
            });

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

        setIsLoading(false);
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
            {
                isLoading? <div className="loading-block">
                    <div style={{width: 75, height: 75}}>
                        <CircularProgressbar text="Loading..." value={percentage} styles={{
                            path: {
                                transition: 'stroke-dashoffset 0.1s ease 0s',
                            }
                        }}/>
                    </div>
                </div> : <div></div>
            }
        </div>
    );
}

export default SignUp;