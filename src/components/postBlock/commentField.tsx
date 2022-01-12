import { leaveComment, getUserState, updateUserState } from '../../utils';
import { WebContext } from '../../context/WebContext';
import { useState, useContext } from 'react';
import { Post, Comment, DataType, Page } from '../../constants';
import { DEFAULT_COMMENT_KARMA } from '../../config';
import WritingField from '../writingField/writingField';

type Props = {
    post: Post,
    closeComment: () => void,
    page: Page,
    setPostToShow: (p: any) => void,
}

const CommentField = (props: Props) => {
    const [ epkNonce, setEpkNonce ] = useState(0);
    const { user, setUser, shownPosts, setShownPosts, isLoading, setIsLoading } = useContext(WebContext);

    const preventPropagation = (event: any) => {
        event.stopPropagation();
    }

    const submitComment = async (reputation: number, content: string) => {
        if (user === null) {
            console.error('user not login!');
        } else if (content.length === 0) {
            console.error('nothing happened, no input.')
        } else {
            const ret = await leaveComment(user.identity, content, props.post.id, epkNonce, reputation, user.spent, user.userState)
            if (ret.error === undefined) {
                let c: Comment = {
                    type: DataType.Comment,
                    id: ret.commentId,
                    post_id: props.post.id,
                    content,
                    votes: [],
                    upvote: 0,
                    downvote: 0,
                    isUpvoted: false,
                    isDownvoted: false,
                    epoch_key: user.epoch_keys[epkNonce],
                    username: 'username',
                    post_time: Date.now(),
                    reputation: +reputation,
                    isAuthor: true,
                    current_epoch: ret.currentEpoch,
                    tx: ret.transaction,
                    proofIndex: 0,
                };
                const filteredPosts = shownPosts.filter((p) => p.id != props.post?.id)
                let comments = props.post.comments.length > 0? [c, ...props.post.comments] : [c];
                let p = {...props.post, comments};

                props.setPostToShow(p);
                setShownPosts([p, ...filteredPosts]);
                setUser({...user, spent: user.spent + DEFAULT_COMMENT_KARMA, userState: ret.userState.toJSON()})
            
                setIsLoading(false);

                props.closeComment();
            } else {
                console.error(ret.error);
                setIsLoading(false);
                const { userState, spent } = await updateUserState(user.identity, user.userState)
                setUser({...user, spent: spent, userState: userState})
                props.closeComment();
            }
        }
    }

    const setEpk = (epk: number) => {
        setEpkNonce(epk);
    }

    return (
        <div className="comment-field">
            <WritingField
                type={DataType.Comment} 
                epkNonce={epkNonce}
                changeEpk={setEpk}
                submit={submitComment} 
                submitBtnName="Comment"
                onClick={preventPropagation}
            />
        </div>
    );
}

export default CommentField;