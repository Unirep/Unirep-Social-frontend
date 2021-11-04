import React, { useState, useContext, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import Jdenticon from 'react-jdenticon';
import dateformat from 'dateformat';

import { WebContext } from '../../context/WebContext';
import { Post, Page, notLoginText, loadingText } from '../../constants';
import VotersList from './votersList';
import CommentField from './commentField';
import CommentBlock from './commentBlock';
import BlockHeader from './blockHeader';
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
    const [ showComment, setShowComment ] = useState(false);
    const [ isVotersListOn, setIsVotersListOn ] = useState(false);
    const shownVoters = 4;

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
            setShowComment((prevState) => !prevState);
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
            <BlockHeader 
                data={post}
                page={page}
            />
            <div className="post-block-main">
                <div className="post-block-info">
                    <div className="datetime-text">{date}</div>
                    <div className="datetime-text">|</div>
                    <div className="etherscan"> 
                        <span>Etherscan</span>
                        <img src="/images/etherscan.png" />
                    </div>
                    <div className="post-share">
                        <img src="/images/share.png" />
                    </div>
                </div>
                <div className="post-text">{post.content}</div>
            </div>

            <div className='post-voters' onClick={switchVotersList}>
                {
                    post.votes.slice(0, shownVoters).map((vote, index) => (
                        <div className="voter" key={vote.epoch_key + '-' + index}><Jdenticon size="19" value={vote.epoch_key} /></div>
                    ))
                }
                {
                    post.votes.length > shownVoters? <div className="voter-text">+{post.votes.length - shownVoters}</div> : <div></div>
                }
                <div className="voter-text voter-more">{isVotersListOn? "hide" : "show"}</div>
            </div>
            { isVotersListOn? 
                <VotersList votes={post.votes}/> : <div></div>
            }
            <div className="comment-block">
                <div className={showComment? "comment-btn without-bottom" : user && !isLoading? "comment-btn" : "comment-btn disabled"} 
                    onClick={user && !isLoading? switchComment : ()=>{}} 
                    onMouseOver={onHover} onMouseLeave={onLeave}>
                    <img src="/images/comment.png"/>
                    <span>Comment</span>
                </div>
                { showComment? 
                    <CommentField post={post} closeComment={() => setShowComment(false)} page={page}/> : <div></div>
                }
                { isHover? <div className="hover-box">{hoverText}</div>:<div></div>}
            </div>
            { post.comments.length > 0? 
                <div className="comments-list">
                    {
                        page === Page.Home? (
                            <div>
                                <CommentBlock comment={post.comments[0]} page={page} />
                                <div className="view-more-comments" onClick={() => history.push(`/post/${post.id}`, {commentId: ''})}>View more comments</div>
                            </div>
                        ) : post.comments.map(comment => comment.id === commentId? 
                            (<div ref={gotoComment} key={comment.id}><CommentBlock comment={comment} page={page} /></div>) :
                            (<CommentBlock comment={comment} key={comment.id} page={page} />))
                    }
                </div> : <div></div>
            }
        </div>
    );
};

export default PostBlock;