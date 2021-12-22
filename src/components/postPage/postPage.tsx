import { useContext, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Location } from 'history';
import { Page, Params, Post } from '../../constants';
import { WebContext } from '../../context/WebContext';
import { PostPageContext } from '../../context/PostPageContext';
import PostBlock from '../postBlock/postBlock';
import VoteBox from '../voteBox/voteBox';
import { getPostById } from '../../utils';
import './postPage.scss';

const PostPage = () => {
    const { user } = useContext(WebContext);
    const { id } = useParams<Params>();
    const location = useLocation<Location>();
    const state = JSON.parse(JSON.stringify(location.state));
    const commentId = state.commentId;
    const [postToShow, setPostToShow] = useState();

    const [isUpVoteBoxOn, setIsUpVoteBoxOn] = useState(false);
    const [isDownVoteBoxOn, setIsDownVoteBoxOn] = useState(false);
    const [voteReceiver, setVoteReceiver] = useState<any>(null);

    useEffect(() => {
        const setPost = async () => {
            const ret = await getPostById(user? user.epoch_keys : [], id);
            setPostToShow(ret);
        }

        setPost();
    }, []);

    const closeAll = () => {
        setIsUpVoteBoxOn(false);
        setIsDownVoteBoxOn(false);
        setVoteReceiver(null);
    }

    return (
        <div className="default-gesture" onClick={closeAll}>
            <PostPageContext.Provider value={{
                    isPostPageUpVoteBoxOn: isUpVoteBoxOn, setIsPostPageUpVoteBoxOn: setIsUpVoteBoxOn, 
                    isPostPageDownVoteBoxOn: isDownVoteBoxOn, setIsPostPageDownVoteBoxOn: setIsDownVoteBoxOn,
                    postPageVoteReceiver: voteReceiver, setPostPageVoteReceiver: setVoteReceiver,}}>
                <div className="main-content">
                    {
                        postToShow === undefined? 
                            <div>No such post with id {id}.</div> : 
                            <PostBlock 
                                post={postToShow} 
                                page={Page.Post}
                                commentId={commentId}
                            />
                    }  
                </div>
                { voteReceiver !== null?
                        (isUpVoteBoxOn? <VoteBox isUpvote={true} data={voteReceiver} setPostToShow={setPostToShow} /> : 
                        isDownVoteBoxOn? <VoteBox isUpvote={false} data={voteReceiver} setPostToShow={setPostToShow} /> : <div></div>) : <div></div>
                }
            </PostPageContext.Provider>
        </div>
    );
}

export default PostPage;