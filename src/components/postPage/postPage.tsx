import { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';

import './postPage.scss';
import { WebContext } from '../../context/WebContext';

import BasicPage from '../basicPage/basicPage';
import { Page, Params } from '../../constants';
import PostBlock from '../postBlock/postBlock';
import { getPostById } from '../../utils';


const PostPage = () => {
    const { id } = useParams<Params>();
    const { shownPosts, setShownPosts } = useContext(WebContext);

    const setPost = async () => {
        let ret: any = null;
        try {
            ret = await getPostById(id);
            setShownPosts([ret]);
        } catch (e) {
            setShownPosts([]);
        }
    }

    useEffect(() => {
        setPost();
    }, []);

    return (
        <BasicPage>
            {
                shownPosts.length === 0? 
                    <div>No such post with id {id}.</div> : 
                    <PostBlock 
                        post={shownPosts[0]} 
                        page={Page.Post}
                    />
            }  
        </BasicPage> 
        
    );
}

export default PostPage;