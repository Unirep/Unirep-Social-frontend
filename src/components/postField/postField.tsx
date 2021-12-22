import { useState, useContext }  from 'react';

import { publishPost, getUserState, updateUserState } from '../../utils';
import { Post, DataType, Page } from '../../constants';
import { DEFAULT_POST_KARMA } from '../../config';
import { WebContext } from '../../context/WebContext';
import { MainPageContext } from '../../context/MainPageContext';
import { UserPageContext } from '../../context/UserPageContext';
import './postField.scss';
import WritingField from '../writingField/writingField';

type Props = {
    page: Page,
}

const PostField = ({ page }: Props) => {

    const [epkNonce, setEpkNonce] = useState(0); // maybe it should be the first available epk

    const { user, setUser, shownPosts, setShownPosts, isLoading, setIsLoading } = useContext(WebContext);
    const { 
        isPostFieldActive: isMainPagePostFieldActive, 
        setIsPostFieldActive: setIsMainPagePostFieldActive,
    } = useContext(MainPageContext);

    const { 
        isPostFieldActive: isUserPagePostFieldActive, 
        setIsPostFieldActive: setIsUserPagePostFieldActive
    } = useContext(UserPageContext);

    const setIsPostFieldActive = (value: boolean) => {
        if (page === Page.Home) {
            setIsMainPagePostFieldActive(value);
        } else if (page === Page.User) {
            setIsUserPagePostFieldActive(value);
        }
    }

    const init = () => {
        setIsPostFieldActive(false);
        setEpkNonce(0);
        setIsLoading(false);
    }

    const preventPropagation = (event: any) => {
        event.stopPropagation();
    }

    const activateInput = (event: any) => {
        event.stopPropagation();
        setIsPostFieldActive(true);
    }

    const changeEpk = (epk: number) => {
        if (user != null) {
            setEpkNonce(epk);
        }  
    }

    const submitPost = async (reputation: number, content: string) => {
        if (user === null) {
            console.log('not login yet.');
        } else if (content.length === 0) {
            console.error('not enter anything yet.');
        } else {
            const ret = await publishPost(content, epkNonce, user.identity, reputation, user.spent, user.userState); // content, epkNonce, identity, minRep
            if (ret.error === undefined) {
                const newPost: Post = {
                    type: DataType.Post,
                    id: ret.postId,
                    content,
                    votes: [],
                    upvote: 0,
                    downvote: 0,
                    isUpvoted: false,
                    isDownvoted: false,
                    epoch_key: ret.epk,
                    username: 'username',
                    post_time: Date.now(),
                    reputation: +reputation,
                    comments: [],
                    isAuthor: true,
                    current_epoch: ret.currentEpoch,
                    tx: ret.transaction
                }
                
                setShownPosts([newPost, ...shownPosts]);
                setUser({...user, spent: user.spent + DEFAULT_POST_KARMA, userState: ret.userState.toJSON()})
            } else {
                console.error(ret.error);
                // update user state
                const { userState, spent } = await updateUserState(user.identity, user.userState)
                setUser({...user, spent: spent, userState: userState.toJSON()})
            }
        }
        init();
    }

    return (
        <div className="post-field">
            {(page === Page.Home? isMainPagePostFieldActive : isUserPagePostFieldActive) && user && user.identity ?
                <WritingField 
                    type={DataType.Post} 
                    epkNonce={epkNonce}
                    changeEpk={changeEpk}
                    submit={submitPost} 
                    submitBtnName="Post"
                    onClick={preventPropagation}
                /> : 
                <div className="post-field-before">
                    <div className="input-field" onClick={activateInput}>Share something!</div>
                </div>
            }
        </div>
    );
};

export default PostField;