import { useState, useContext, useEffect } from 'react';
import { HashLink as Link } from 'react-router-hash-link'; 

import './loadingWidget.scss';
import { WebContext } from '../../context/WebContext';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppContext';

import { publishPost, vote, leaveComment, getEpochSpent, userStateTransition, getUserState, getEpochKeys, getAirdrop, getNextEpochTime, getCurrentEpoch } from '../../utils';
import { ActionType } from '../../constants';
import * as config from '../../config';
import { getPostById } from '../../utils';

enum LoadingState {
    loading,
    success,
    failed,
    none,
}

const LoadingWidget = () => {
    const { action, setAction, setNextUSTTime, setDraft, shownPosts, setShownPosts } = useContext(WebContext);
    const { user, setUser } = useAuth();
    const { isPending, setIsPending } = useAppState();

    const [ loadingState, setLoadingState ] = useState<LoadingState>(LoadingState.none);
    const [ isFlip, setFlip ] = useState<boolean>(false);
    const [ goto, setGoto ] = useState<string>('');
    const [ tx, setTx ] = useState<string>(''); 
    
    const doUST = async () => {
        let USTData: any = null;
        USTData = await userStateTransition(action.data.identity, action.data.userState);
        if (USTData?.transaction) {
            const recept = await config.DEFAULT_ETH_PROVIDER.waitForTransaction(USTData.transaction)
            console.log('receipt', recept)
        }

        let newUser;
        if (user !== null) {
            const userStateResult = await getUserState(user.identity);
            const epks = getEpochKeys(user.identity, userStateResult.currentEpoch);
            const rep = userStateResult.userState.getRepByAttester(BigInt(config.UNIREP_SOCIAL_ATTESTER_ID));
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
            if (USTData.error !== undefined) return USTData
            const { error } = await getAirdrop(user.identity, userStateResult.userState);
            if (error !== undefined) {
                USTData = {...USTData, error};
            } 
        }

        return USTData;
    }

    useEffect(() => {
        const doAction = async () => {
            setIsPending(true);
            console.log('Todo action: ' + JSON.stringify(action));
            setLoadingState(LoadingState.loading);

            const next = await getNextEpochTime();
            setNextUSTTime(next);

            let data: any = {};
            let newUser: any = undefined;
            let spentRet = await getEpochSpent(user? user.epoch_keys : []);

            const currentEpoch = await getCurrentEpoch();
            if (user !== null && user !== undefined && JSON.parse(user.userState).latestTransitionedEpoch !== currentEpoch) {
                console.log('user epoch is not the same as current epoch, do user state transition, ' + JSON.parse(user?.userState).latestTransitionedEpoch + ' != ' + currentEpoch);
                data = await doUST();  
                newUser = data.user;

                if (data.error !== undefined) {
                    console.log(data.error);
                    setUser({...newUser, spent: 0});
                    setGoto('/');
                    setLoadingState(LoadingState.failed);
                    setIsPending(false);
                    return;
                }

                spentRet = 0;
            }
            
            console.log('in the head of loading widget, spent is: ' + spentRet);

            if (action.action === ActionType.Post) {
                data = await publishPost(
                    action.data.content,
                    action.data.epkNonce,
                    action.data.identity,
                    action.data.reputation,
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
                    action.data.reputation,
                    spentRet,
                    action.data.userState
                );
                spentRet += config.DEFAULT_COMMENT_KARMA
            } else if (action.action === ActionType.Vote) {
                if (action.data.isPost) {
                    data = await vote(
                        action.data.identity, 
                        action.data.upvote, 
                        action.data.downvote, 
                        action.data.data, 
                        action.data.epk, 
                        action.data.epkNonce, 
                        action.data.upvote + action.data.downvote, 
                        action.data.isPost, 
                        spentRet, 
                        action.data.userState
                    );
                } else {
                    data = await vote(
                        action.data.identity, 
                        action.data.upvote, 
                        action.data.downvote, 
                        action.data.data.split('_')[1], 
                        action.data.epk, 
                        action.data.epkNonce, 
                        action.data.upvote + action.data.downvote, 
                        action.data.isPost, 
                        spentRet, 
                        action.data.userState
                    );
                }
                
                spentRet += action.data.upvote + action.data.downvote
            } else if (action.action === ActionType.UST) {
                console.log('already check epoch and do ust...');
            }

            if (user !== null) {
                if (newUser === undefined) {
                    setUser({...user, spent: spentRet});
                } else {
                    setUser({...newUser, spent: spentRet});
                }
            }

            if (data.error !== undefined) {
                console.log('action ' + action.action + ' error: ' + data.error);
                setLoadingState(LoadingState.failed);
                setIsPending(false);
                return;
            } else {
                console.log('without error.');
                setDraft(null);
                setLoadingState(LoadingState.success);
            }

            let pid: string = '';
            if (action.action === ActionType.Post) {
                setGoto(data.error === undefined? '/post/' + data.transaction : '/new');
                pid = data.transaction
            } else if (action.action === ActionType.Vote) {
                setGoto('/post/' + action.data.data.replace('_', '#'));
                pid = action.data.data.split('_')[0];
            } else if (action.action === ActionType.Comment) {
                setGoto(data.error === undefined? '/post/' + action.data.data + '#' + data.transaction : '/post/' + action.data.data);
                pid = action.data.data;
            } else if (action.action === ActionType.UST) {
                setGoto('/');
            }
            setTx(data.transaction);

            if (pid.length > 0) {
                const postRet = await getPostById(pid);
                let newShownPosts = shownPosts.map(p => p.id === pid? postRet: p);
                setShownPosts(newShownPosts);
            }
            
            setIsPending(false);
        }
        
        if (action !== null && user !== null && !isPending) {
            console.log('do action');
            doAction();  
        } 
    }, [action]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFlip(!isFlip);
        }, 500);

        return () => clearTimeout(timer);
    }, [isFlip]);

    useEffect(() => {
        if (user === null) {
            resetLoading();
        }
    }, [user])

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
                    </div> : loadingState === LoadingState.success?
                    <div className="loading-block">
                        <img src="/images/checkmark.svg" />
                        <span>{action.action === ActionType.Post? 'Post is finalized': action.action === ActionType.Comment? 'Comment is finalized': action.action === ActionType.Vote? 'Succeed!' : ''}</span>
                        { action.action === ActionType.UST? 
                            <div className="info-row">User State Transition done.</div> : 
                            <div className="info-row">
                                <Link className="link" to={goto}>See my content</Link> | <a className="link" target="_blank" href={'https://goerli.etherscan.io/tx/' + tx}>Etherscan <img src="/images/etherscan-white.svg"/></a>
                            </div>
                        } 
                    </div> : loadingState === LoadingState.failed?
                    <div className="loading-block failed">
                        <img src="/images/close-red.svg" />
                        <span>Posting to blockchain failed.</span> 
                        <div className="info-row">
                            <Link className="link failed" to={goto}>See my content</Link>
                        </div>
                    </div> : <div></div>
            }
        </div>
    );
}

export default LoadingWidget;