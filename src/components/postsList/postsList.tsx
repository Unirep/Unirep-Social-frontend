import { useEffect, useState } from 'react';

import './postsList.scss';
import useGetData from '../../hooks/useGetData';

import PostBlock from '../postBlock/postBlock';
import { QueryType, Page, ActionType, Post } from '../../constants';
import { LOAD_POST_COUNT } from '../../config';

type Props = {
    query: QueryType
}

const PostsList = ({ query }: Props) => {
    const [lastRead, setLastRead] = useState<string>('0');
    const [posts, setPosts] = useState<Post[]>([]);
    const [args, setArgs] = useState<string>(`query=${query}&lastRead=0`);

    const { data, loading, error } = useGetData(ActionType.Post, '', args);

    useEffect(() => {
        if (data !== null && data.length > 0) {
            if (lastRead === '0') {
                setPosts(data);
            } else {
                setPosts([...posts, ...data]);
            }
            
        }
    }, [data]);

    useEffect(() => {
        setLastRead('0');
        setArgs(`query=${query}&lastRead=0`);
    }, [query]);

    const loadMorePosts = () => {
        console.log("load more posts, now posts: " + posts.length);
        if (data !== null && data.length > 0) {
            setLastRead(data[data.length-1].id);
            setArgs(`query=${query}&lastRead=${data[data.length-1].id}`);
        }
    }

    return (
        <div className="post-list">
            {
                loading? <div></div> : 
                    <div>
                        {
                            posts.length > 0? 
                                posts.map((post, i) => (
                                    <PostBlock 
                                        key={post.id + i} 
                                        post={post} 
                                        page={Page.Home}
                                    />
                                )) : <div className="no-posts">
                                        <img src="/images/glasses.svg" />
                                        <p>It's empty here.<br />People just being shy, no post yet.</p>
                                    </div>
                        }
                        {
                            posts.length > 0 && posts.length % LOAD_POST_COUNT === 0? 
                                <div className="load-more-button" onClick={loadMorePosts}>Load more posts</div> : <div></div>
                        }
                    </div>
            }
        </div>
    );
}

export default PostsList;