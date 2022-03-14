import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import './mainPage.scss';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppContext';

import BasicPage from '../basicPage/basicPage';
import { QueryType, AlertType } from '../../constants';
import { DEFAULT_POST_KARMA } from '../../config';
import PostsList from '../postsList/postsList';
import Feed from '../feed/feed';


const MainPage = () => {

    const history = useHistory();

    const { user } = useAuth();
    const { isPending } = useAppState();

    const [query, setQuery] = useState<QueryType>(QueryType.New);

    const gotoNewPost = () => {
        if (!isPending && user !== null && (user.reputation - user.spent) >= DEFAULT_POST_KARMA){
            history.push('/new', {isConfirmed: true});
        }
    }

    return (
        <BasicPage>
            <div className="create-post" onClick={gotoNewPost}>
                { user === null? AlertType.postNotLogin : 
                    user.reputation - user.spent < DEFAULT_POST_KARMA? 
                        AlertType.postNotEnoughPoints : 'Create post'
                }
            </div>
            <Feed feedChoice={query} setFeedChoice={setQuery} />
            <PostsList 
                query={query}
            />
        </BasicPage>
    );
};

export default MainPage;