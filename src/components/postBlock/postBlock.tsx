import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import dateformat from 'dateformat';

import { WebContext } from '../../context/WebContext';
import { Post, Page, ButtonType } from '../../constants';
import CommentField from './commentField';
import CommentBlock from './commentBlock';
import BlockButton from './blockButton';
import './postBlock.scss';


type Props = {
    post: Post,
    page: Page
}

const PostBlock = ({ post, page }: Props) => {

    const history = useHistory();
    const { isLoading, user } = useContext(WebContext);
    const gotoComment = React.createRef<HTMLDivElement>();

    const date = dateformat(new Date(post.post_time), "dd/mm/yyyy hh:MM TT");
    const [ showCommentField, setShowCommentField ] = useState(false);

    const textLimit = 240;

    useEffect(() => {
        // if (commentId !== undefined) {
        //     console.log(commentId);
        //     gotoComment.current?.scrollIntoView({
        //         behavior: 'smooth',
        //         block: 'center',
        //     })
        // }
    }, []);

    return (
        <div className="post-block">
            <div className="block-header">
                <p className="date">{date} |</p>
                <p className="user">Post by {post.epoch_key} <img src="/images/lighting.svg" /> </p>
                <a className="etherscan" target="_blank" href={`https://goerli.etherscan.io/tx/${post.id}`}> 
                    <span>Etherscan</span>
                    <img src="/images/etherscan.svg" />
                </a>
            </div>
            {page === Page.Home? <div className="divider"></div> : <div></div>}
            <div className="block-content" onClick={() => history.push(`/post/${post.id}`, {commentId: ''})}>
                <div className="title">{post.title}</div>
                <div className="content">{post.content.length > textLimit && page == Page.Home? post.content.slice(0, textLimit) + '...' : post.content}</div>
            </div>
            {page === Page.Home? <div className="divider"></div> : <div></div>}
            <div className="block-buttons">
                <BlockButton type={ButtonType.Comments} count={post.commentsCount} data={post} />
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
                                    <div key={i} id={c.id}>
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