import { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import './loadingWidget.scss';
import { WebContext } from '../../context/WebContext';
import { publishPost, vote, leaveComment, getEpochSpent } from '../../utils';
import { ActionType } from '../../constants';

enum LoadingState {
    loading,
    succeed,
    fail,
    none,
}

const LoadingWidget = () => {
    const history = useHistory();
    const { setIsLoading, action, setAction, user, setUser } = useContext(WebContext);
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

            const spentRet = await getEpochSpent(user? user.epoch_keys : []);
            console.log('in the head of loading widget, spent is: ' + spentRet);
            if (user !== null) {
                setUser({...user, spent: spentRet});
            }

            if (action.action === ActionType.Post) {
                data = await publishPost(
                    action.data.content,
                    action.data.epkNonce,
                    action.data.identity,
                    0,
                    spentRet,
                    action.data.userState,
                );
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
            } 
            console.log(data);
            console.log('action done.');

            if (data.error !== undefined) {
                console.log('error: ' + error);
                setLoadingState(LoadingState.fail);
            } else {
                console.log('without error.');

                if (action.action === ActionType.Post) {
                    setSuccessPost(data.transaction);
                } else if (action.action === ActionType.Vote) {
                    setSuccessPost(action.data.data);
                } else if (action.action === ActionType.Comment) {
                    setSuccessPost(action.data.data + '_' + data.transaction);
                }
                
                setLoadingState(LoadingState.succeed);
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
        resetLoading();

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
                        <span>{loadingState === LoadingState.loading? "Submitting your content..." : "succeed or fail"}</span>
                    </div> : loadingState === LoadingState.succeed?
                    <div className="loading-block">
                        <img src="/images/checkmark.svg" />
                        <span>{action.action === ActionType.Post? 'Post is finalized': action.action === ActionType.Comment? 'Comment is finalized': action.action === ActionType.Vote? 'Succeed!' : ''}</span>
                        <div className="info-row">
                            <span onClick={gotoPage}>See my post</span> | <span onClick={gotoEtherscan}>Etherscan <img src="/images/etherscan-white.svg"/></span>
                        </div>
                    </div> : loadingState === LoadingState.fail?
                    <div className="loading-block failed">
                        <img src="/images/close-red.svg" />
                        <span>Fail.</span> 
                    </div> : <div></div>
            }
        </div>
    );
}

export default LoadingWidget;