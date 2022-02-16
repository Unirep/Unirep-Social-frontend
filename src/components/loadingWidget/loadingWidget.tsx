import { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link'; 

import './loadingWidget.scss';
import { WebContext } from '../../context/WebContext';
import { publishPost, vote, leaveComment, getEpochSpent, userStateTransition, getUserState, getEpochKeys, getAirdrop, getNextEpochTime, getCurrentEpoch } from '../../utils';
import { ActionType } from '../../constants';
import * as config from '../../config';

enum LoadingState {
    loading,
    succeed,
    fail,
    none,
}

const LoadingWidget = () => {
    const { setIsLoading, action, setAction, user, setUser, setNextUSTTime, setDraft } = useContext(WebContext);
    const [ loadingState, setLoadingState ] = useState<LoadingState>(LoadingState.none);
    const [ isFlip, setFlip ] = useState<boolean>(false);
    const [ goto, setGoto ] = useState<string>('');
    
    const doUST = async () => {
        let USTData: any = null;
        USTData = await userStateTransition(action.data.identity, action.data.userState);
        let newUser;

        if (user !== null) {
            const userStateResult = await getUserState(user.identity);
            const epks = getEpochKeys(user.identity, userStateResult.currentEpoch);
            const rep = userStateResult.userState.getRepByAttester(BigInt(userStateResult.attesterId));
            if (USTData !== undefined) {
                newUser = {...user, 
                    epoch_keys: epks, 
                    reputation: Number(rep.posRep) - Number(rep.negRep), 
                    current_epoch: USTData.toEpoch, 
                    spent: 0,
                    userState: userStateResult.userState.toJSON(),
                    all_epoch_keys: [...user.all_epoch_keys, ...epks]
                }
                USTData = {...USTData, user: newUser};
            }
            const { error } = await getAirdrop(user.identity, userStateResult.userState);
            if (error !== undefined) {
                console.error(error)
                USTData = {...USTData, error};
            } 
        }

        return USTData;
    }

    useEffect(() => {
        const doAction = async () => {
            console.log('Todo action: ' + JSON.stringify(action));
            setIsLoading(true);
            setLoadingState(LoadingState.loading);

            let data: any = {};
            let newUser: any = {};
            let spentRet = await getEpochSpent(user? user.epoch_keys : []);

            if (action.action === ActionType.UST) {
                data = await doUST();  
                spentRet = 0;
            } else {
                const currentEpoch = await getCurrentEpoch();
                if (user !== undefined && JSON.parse(user?.userState).latestTransitionedEpoch !== currentEpoch) {
                    console.log('user epoch is not the same as current epoch, do user state transition, ' + JSON.parse(user?.userState).latestTransitionedEpoch + ' != ' + currentEpoch);
                    data = await doUST();  

                    if (data.error !== undefined) {
                        console.log(data.error);
                        setGoto('/');
                        setLoadingState(LoadingState.fail);
                        return;
                    } else {
                        newUser = data.user;
                    }

                    spentRet = 0;
                }
                
                console.log('in the head of loading widget, spent is: ' + spentRet);

                if (action.action === ActionType.Post) {
                    data = await publishPost(
                        action.data.content,
                        action.data.epkNonce,
                        action.data.identity,
                        0,
                        spentRet,
                        action.data.userState,
                        action.data.title,
                    );
                    spentRet += config.DEFAULT_POST_KARMA
                } else if (action.action === ActionType.Comment) {
                    data = await leaveComment(
                        action.data.identity,
                        action.data.content,
                        action.data.data,
                        action.data.epkNonce,
                        0,
                        spentRet,
                        action.data.userState
                    );
                    spentRet += config.DEFAULT_COMMENT_KARMA
                } else if (action.action === ActionType.Vote) {
                    data = await vote(
                        action.data.identity, 
                        action.data.upvote, 
                        action.data.downvote, 
                        action.data.data, 
                        action.data.epk, 
                        action.data.epkNonce, 
                        0, 
                        action.data.isPost, 
                        spentRet, 
                        action.data.userState
                    );
                    spentRet += action.data.upvote + action.data.downvote
                }
            }

            if (data.error !== undefined) {
                console.log('action ' + action.action + ' error: ' + data.error);
                setLoadingState(LoadingState.fail);
                return;
            } else {
                console.log('without error.');
                setDraft(null);

                newUser = data.user;
                if (user !== null) {
                    if (newUser === undefined) {
                        setUser({...user, spent: spentRet});
                    } else {
                        setUser({...newUser, spent: spentRet});
                    }
                }
                setLoadingState(LoadingState.succeed);
            }

            if (action.action === ActionType.Post) {
                setGoto(data.error === undefined? '/post/' + data.transaction : '/new');
            } else if (action.action === ActionType.Vote) {
                setGoto('/post/' + action.data.data.replace('_', '#'));
            } else if (action.action === ActionType.Comment) {
                setGoto(data.error === undefined? '/post/' + action.data.data + '#' + data.transaction : '/post/' + action.data.data);
            } else if (action.action === ActionType.UST) {
                setGoto('/');
            }

            const next = await getNextEpochTime();
            setNextUSTTime(next);
            
            setIsLoading(false);
        }
        
        if (action !== null && user !== null) {
            doAction();  
        }
    }, [action]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFlip(!isFlip);
        }, 500);

        return () => clearTimeout(timer);
    }, [isFlip]);

    const resetLoading = () => {
        if (loadingState === LoadingState.loading) {
            return;
        }

        setAction(null);
        setLoadingState(LoadingState.none);
    }

    const gotoEtherscan = (event: any) => {
        event.stopPropagation();
        resetLoading();
    }

    return (
        <div className="loading-widget" onClick={resetLoading}>
            {
                loadingState === LoadingState.none? <div></div> : 
                    loadingState === LoadingState.loading? 
                    <div className="loading-block">
                        <img src="/images/loader.svg" style={{ transform: `scaleX(${isFlip? '-1': '1'})` }} />
                        <span>Submitting your content...</span>
                        <div className="info-row">Please wait 'til this transaction complete for creating post, comment, boost, or squash. This is the life of blockchain :P </div>
                    </div> : loadingState === LoadingState.succeed?
                    <div className="loading-block">
                        <img src="/images/checkmark.svg" />
                        <span>{action.action === ActionType.Post? 'Post is finalized': action.action === ActionType.Comment? 'Comment is finalized': action.action === ActionType.Vote? 'Succeed!' : ''}</span>
                        { action.action === ActionType.UST? 
                            <div className="info-row">User State Transition done.</div> : 
                            <div className="info-row">
                                <Link className="link" to={goto}>See my content</Link> | <span onClick={gotoEtherscan}>Etherscan <img src="/images/etherscan-white.svg"/></span>
                            </div>
                        } 
                    </div> : loadingState === LoadingState.fail?
                    <div className="loading-block failed">
                        <img src="/images/close-red.svg" />
                        <span>Fail.</span> 
                        <div className="info-row">
                            <Link className="link" to={goto}>See my content</Link>
                        </div>
                    </div> : <div></div>
            }
        </div>
    );
}

export default LoadingWidget;