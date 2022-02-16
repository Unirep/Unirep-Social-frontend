import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Page, Params, Post } from '../../constants';
import PostBlock from '../postBlock/postBlock';
import SideColumn from '../sideColumn/sideColumn';
import { getPostById } from '../../utils';
import './postPage.scss';

const PostPage = () => {
    const { id } = useParams<Params>();
    const [postToShow, setPostToShow] = useState<Post|undefined>();

    useEffect(() => {
        const setPost = async () => {
            const ret = await getPostById(id);
            setPostToShow(ret);
        }

        setPost();
    }, []);

    return (
        <div className="wrapper">
            <div className="default-gesture">
                <div className="margin-box"></div>
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
                <div className="side-content">
                    <SideColumn page={Page.Post} />
                </div>
                <div className="margin-box"></div>
            </div>
        </div> 
        
    );
}

export default PostPage;