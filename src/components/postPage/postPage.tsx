import { useContext, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Location } from 'history';
import { Page, Params, Post } from '../../constants';
import { WebContext } from '../../context/WebContext';
import { PostPageContext } from '../../context/PostPageContext';
import PostBlock from '../postBlock/postBlock';
import SideColumn from '../sideColumn/sideColumn';
import { getPostById } from '../../utils';
import './postPage.scss';

const PostPage = () => {
    const { user } = useContext(WebContext);
    const { id } = useParams<Params>();
    const location = useLocation<Location>();
    const state = JSON.parse(JSON.stringify(location.state));
    const commentId = state.commentId;
    const [postToShow, setPostToShow] = useState<Post|undefined>();

    const [isUpVoteBoxOn, setIsUpVoteBoxOn] = useState(false);
    const [isDownVoteBoxOn, setIsDownVoteBoxOn] = useState(false);
    const [voteReceiver, setVoteReceiver] = useState<any>(null);

    useEffect(() => {
        const setPost = async () => {
            const ret = await getPostById(id);
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
        <div className="wrapper">
            <div className="default-gesture" onClick={closeAll}>
                <PostPageContext.Provider value={{
                        isPostPageUpVoteBoxOn: isUpVoteBoxOn, setIsPostPageUpVoteBoxOn: setIsUpVoteBoxOn, 
                        isPostPageDownVoteBoxOn: isDownVoteBoxOn, setIsPostPageDownVoteBoxOn: setIsDownVoteBoxOn,
                        postPageVoteReceiver: voteReceiver, setPostPageVoteReceiver: setVoteReceiver,}}>
                    <div className="margin-box"></div>
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
                    <div className="side-content">
                        <SideColumn page={Page.Post} />
                    </div>
                    <div className="margin-box"></div>
                </PostPageContext.Provider>
            </div>
        </div> 
        
    );
}

export default PostPage;