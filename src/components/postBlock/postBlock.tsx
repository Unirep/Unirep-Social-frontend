import React, { useState, useContext, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import Jdenticon from 'react-jdenticon';
import dateformat from 'dateformat';

import { WebContext } from '../../context/WebContext';
import { Post, Page, notLoginText, loadingText, ButtonType } from '../../constants';
import VotersList from './votersList';
import CommentField from './commentField';
import CommentBlock from './commentBlock';
import BlockButton from './blockButton';
import './postBlock.scss';


type Props = {
    post: Post,
    page: Page,
    commentId: string | undefined
}

const PostBlock = ({ post, page, commentId } : Props) => {

    const history = useHistory();
    const { isLoading, user } = useContext(WebContext);
    const gotoComment = React.createRef<HTMLDivElement>();

    const [isHover, setIsHover] = useState(false);
    const [hoverText, setHoverText] = useState<string>('');

    const date = dateformat(new Date(post.post_time), "dd/mm/yyyy hh:MM TT");
    const [ showCommentField, setShowCommentField ] = useState(false);
    const [ isVotersListOn, setIsVotersListOn ] = useState(false);
    const shownVoters = 4;

    const textLimit = 240;

    useEffect(() => {
        if (commentId !== undefined) {
            console.log(commentId);
            gotoComment.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }
    }, []);

    const switchVotersList = (event: any) => {
        event.stopPropagation();
        if (isVotersListOn) {
            setIsVotersListOn(false);
        } else {
            setIsVotersListOn(true);
        }
    }

    const switchComment = () => {
        if (!isLoading) {
            setShowCommentField((prevState) => !prevState);
        }
    }

    const onHover = () => {
        if (isLoading) {
            setIsHover(true);
            setHoverText(loadingText);
        } else if (user === null) {
            setIsHover(true);
            setHoverText(notLoginText);
        } 
    }

    const onLeave = () => {
        setIsHover(false);
        setHoverText('');
    }

    return (
        <div className="post-block">
            <div className="block-header">
                <p className="date">{date} |</p>
                <p className="user">Post by {post.epoch_key} <img src="/images/lighting.svg" /> </p>
                <p className="etherscan">Etherscan <img src="/images/etherscan.svg" /></p>
            </div>
            {page === Page.Home? <div className="divider"></div> : <div></div>}
            <div className="block-content" onClick={() => history.push(`/post/${post.id}`, {commentId: ''})}>
                <div className="title">{post.title}</div>
                <div className="content">{post.content.length > textLimit && page == Page.Home? post.content.slice(0, textLimit) + '...' : post.content}</div>
            </div>
            {page === Page.Home? <div className="divider"></div> : <div></div>}
            <div className="block-buttons">
                <BlockButton type={ButtonType.Comments} count={post.comments.length} data={post} />
                <BlockButton type={ButtonType.Boost} count={post.upvote} data={post} />
                <BlockButton type={ButtonType.Squash} count={post.downvote} data={post} />
                <BlockButton type={ButtonType.Share} count={0} data={post} />
            </div>
            {page === Page.Home? <div></div> : 
                <div className="comment">
                    <div className="comment-block">
                        {
                            showCommentField? 
                                <CommentField 
                                    post={post}
                                    page={Page.Post}
                                    closeComment={() => setShowCommentField(false)}
                                /> : 
                                <textarea placeholder="What's your thought?" onClick={() => setShowCommentField(true)} />
                        }
                    </div>
                    <div className="divider"></div>
                    {post.comments.length > 0? 
                        <div className="comments-list">
                            {
                                post.comments.map((c, i) => 
                                    <div>
                                        <CommentBlock page={page} comment={c} />
                                        {i < post.comments.length-1? <div className="divider"></div> : <div></div>}
                                    </div>
                                )
                            }
                        </div> : <div className="no-comments">
                            <img src="/images/glasses.svg" />
                            <p>It's empty here.<br/>People just being shy, no comment yet.</p>
                        </div>
                    }
                    
                </div>}
        </div>
    );
};

export default PostBlock;