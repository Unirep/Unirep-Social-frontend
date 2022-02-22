import { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import dateformat from 'dateformat';

import { WebContext } from '../../context/WebContext';
import { Post, Page, ButtonType, AlertType, DataType } from '../../constants';
import CommentField from './commentField';
import CommentBlock from './commentBlock';
import BlockButton from './blockButton';
import './postBlock.scss';

type AlertProps = {
    type: AlertType
}

const AlertBox = ({ type } : AlertProps) => {
    return (
        <div className="alert">
            <img src={`/images/${type === AlertType.commentNotEnoughPoints? 'lighting' : 'glasses'}.svg`} />
            {type}
        </div>
    );
}


type Props = {
    post: Post,
    page: Page,
}

const PostBlock = ({ post, page }: Props) => {

    const history = useHistory();
    const { isLoading, user, draft } = useContext(WebContext);

    const date = dateformat(new Date(post.post_time), "dd/mm/yyyy hh:MM TT");
    const [ showCommentField, setShowCommentField ] = useState(draft !== null && draft.type === DataType.Comment);
    const [ isEpkHovered, setEpkHovered] = useState<boolean>(false);

    const textLimit = 240;

    return (
        <div className="post-block">
            <div className="block-header">
                <p className="date">{date} |</p>
                <p className="user" onMouseEnter={() => setEpkHovered(true)} onMouseLeave={() => setEpkHovered(false)}>
                    Post by {post.epoch_key} <img src="/images/lighting.svg" /> 
                    {/* { isEpkHovered? <div className="show-off-rep">{post.reputation === DEFAULT_POST_KARMA? `This person is very modest, showing off only ${DEFAULT_POST_KARMA} Rep.` : `This person is showing off ${post.reputation} Rep.`}</div> : <div></div>} */}
                </p>
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
                            user === null?
                                <AlertBox type={AlertType.commentNotLogin} /> : 
                                user.reputation - user.spent < 3? 
                                    <AlertBox type={AlertType.commentNotEnoughPoints} /> : 
                                    isLoading? 
                                    <AlertBox type={AlertType.commentLoading} /> : 
                                        showCommentField? 
                                            <CommentField 
                                                post={post}
                                                page={Page.Post}
                                                closeComment={() => setShowCommentField(false)}
                                            /> : 
                                            <textarea placeholder="What do you think?" onClick={() => setShowCommentField(true)} />
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
                            <p>Nothing to see here.<br/>People are just being shy.</p>
                        </div>
                    }
                    
                </div>}
        </div>
    );
};

export default PostBlock;