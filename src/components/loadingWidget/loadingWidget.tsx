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

            if (action.action === ActionType.Post) {
                data = await publishPost(
                    action.data.content,
                    action.data.epkNonce,
                    action.data.identity,
                    0,
                    action.data.spent,
                    action.data.userState,
                );
                console.log(data);
                console.log('action done.');
            } else if (action.action === ActionType.Comment) {
                data = await leaveComment(
                    action.data.identity,
                    action.data.content,
                    action.data.data,
                    action.data.epkNonce,
                    0,
                    action.data.spent,
                    action.data.userState
                );
                console.log(data);
                console.log('action done.');
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
                    action.data.spent, 
                    action.data.userState
                );
                console.log(data);
                console.log('action done.');
            } 

            if (error.length > 0) {
                console.log('error: ' + error);
                setLoadingState(LoadingState.fail);
            } else {
                console.log('without error.');
                if (user !== null) {
                    const spent = await getEpochSpent(user? user.epoch_keys : []);
                    setUser({...user, spent});
                }
                setSuccessPost(data.transaction);
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
        setAction(null);
        setLoadingState(LoadingState.none);
    }

    const gotoPage = () => {
        history.push(`/post/${successPost}`, {commentId: ''});
        resetLoading();
    }

    const gotoEtherscan = () => {
        resetLoading();
    }

    return (
        <div className="loading-widget">
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
                    <div></div> : <div></div>
            }
        </div>
    );
}

export default LoadingWidget;