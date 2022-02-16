import { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

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
    const history = useHistory();
    const { setIsLoading, action, setAction, user, setUser, setNextUSTTime, setDraft } = useContext(WebContext);
    const [ loadingState, setLoadingState ] = useState<LoadingState>(LoadingState.none);
    const [ isFlip, setFlip ] = useState<boolean>(false);
    const [ successPost, setSuccessPost ] = useState<string>('');
    
    useEffect(() => {
        const doAction = async () => {
            console.log('Todo action: ' + JSON.stringify(action));
            setIsLoading(true);
            setLoadingState(LoadingState.loading);

            let error: string = '';
            let data: any = null;
            let transition = false;
            let USTData: any = null;
            
            const next = await getNextEpochTime();
            setNextUSTTime(next);
            let spentRet = await getEpochSpent(user? user.epoch_keys : []);
            const currentEpoch = await getCurrentEpoch();
            if (user !== undefined && JSON.parse(user?.userState).latestTransitionedEpoch !== currentEpoch) {
                console.log('user epoch is not the same as current epoch, do user state transition, ' + JSON.parse(user?.userState).latestTransitionedEpoch + ' != ' + currentEpoch);
                USTData = await userStateTransition(action.data.identity, action.data.userState);
                transition = true;
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
            }  else if (action.action === ActionType.UST) {
                USTData = await userStateTransition(action.data.identity, action.data.userState);
            }

            if (data === null) {
                console.log('perform UST')
            } else if (data?.error !== undefined) {
                console.log('error: ' + error);
                setLoadingState(LoadingState.fail);
            } else {
                console.log('without error.');
                setDraft(null);

                if (action.action === ActionType.Post && user !== null) {
                    setSuccessPost(data.transaction);
                    setUser({...user, spent: spentRet});
                } else if (action.action === ActionType.Vote && user !== null) {
                    setSuccessPost(action.data.data);
                    setUser({...user, spent: spentRet});
                } else if (action.action === ActionType.Comment && user !== null) {
                    setSuccessPost(action.data.data + '_' + data.transaction);
                    setUser({...user, spent: spentRet});
                } 
                setLoadingState(LoadingState.succeed);
            }

            if ((transition) && user !== null) {
                const userStateResult = await getUserState(user.identity);
                const epks = getEpochKeys(user.identity, userStateResult.currentEpoch);
                const rep = userStateResult.userState.getRepByAttester(BigInt(userStateResult.attesterId));
                if (USTData !== undefined) {
                    setUser({...user, 
                        epoch_keys: epks, 
                        reputation: Number(rep.posRep) - Number(rep.negRep), 
                        current_epoch: USTData.toEpoch, 
                        spent: spentRet, 
                        userState: userStateResult.userState.toJSON(),
                        all_epoch_keys: [...user.all_epoch_keys, ...epks],
                    })
                }
                const { error } = await getAirdrop(user.identity, userStateResult.userState);
                if (error !== undefined) {
                    console.error(error)
                    setLoadingState(LoadingState.fail);
                } else {
                    setLoadingState(LoadingState.succeed);
                }
                const next = await getNextEpochTime();
                setNextUSTTime(next);
            }
            
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

    const gotoPage = (event: any) => {
        event.stopPropagation();
        console.log(loadingState);
        
        if (loadingState === LoadingState.fail) {
            if (action.action === ActionType.Post) {
                history.push('/new', {isConfirmed: true});
            } else if (action.action === ActionType.Comment) {
                history.push(`/post/${action.data.data}`)
            } else if (action.action === ActionType.Vote) {
                let dId = action.data.data.split('_')[0];
                history.push(`/post/${dId}`);
            }
        } else {
            console.log('goto page: successPost is = ' + successPost);
            const tmp = successPost.split('_');
            if (tmp.length > 1) {
                if (window.location.pathname === `/post/${tmp[0]}`) {
                    history.go(0);
                } else {
                    history.push(`/post/${tmp[0]}`, {commentId: tmp[1]});
                }
            } else {
                if (window.location.pathname === `/post/${successPost}`) {
                    history.go(0);
                } else {
                    history.push(`/post/${successPost}`, {commentId: ''});
                }
            }
        }

        resetLoading();
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
                                <span onClick={gotoPage}>See my content</span> | <span onClick={gotoEtherscan}>Etherscan <img src="/images/etherscan-white.svg"/></span>
                            </div>
                        } 
                    </div> : loadingState === LoadingState.fail?
                    <div className="loading-block failed">
                        <img src="/images/close-red.svg" />
                        <span>Fail.</span> 
                        <div className="info-row">
                            <span onClick={gotoPage}>See my content</span>
                        </div>
                    </div> : <div></div>
            }
        </div>
    );
}

export default LoadingWidget;