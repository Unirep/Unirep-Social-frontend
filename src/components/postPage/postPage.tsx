import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page, Params } from '../../constants';
import { WebContext } from '../../context/WebContext';
import { PostPageContext } from '../../context/PostPageContext';
import PostBlock from '../postBlock/postBlock';
import VoteBox from '../voteBox/voteBox';
import './postPage.scss';

const PostPage = () => {
    const { shownPosts } = useContext(WebContext);
    const { id } = useParams<Params>();
    const postToShow = shownPosts.find((p) => p.id === id);

    const [isUpVoteBoxOn, setIsUpVoteBoxOn] = useState(false);
    const [isDownVoteBoxOn, setIsDownVoteBoxOn] = useState(false);
    const [voteReceiver, setVoteReceiver] = useState<any>(null);

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
                            />
                    }  
                </div>
                { voteReceiver !== null?
                        (isUpVoteBoxOn? <VoteBox isUpvote={true} data={voteReceiver} /> : 
                        isDownVoteBoxOn? <VoteBox isUpvote={false} data={voteReceiver} /> : <div></div>) : <div></div>
                }
            </PostPageContext.Provider>
        </div>
    );
}

export default PostPage;