import React, { useContext, useState } from 'react';
import { WebContext } from '../../context/WebContext';
import { UserPageContext } from '../../context/UserPageContext';
import { UserPageType, History } from '../../constants';
import UserHeader from './userHeader';
import UserPosts from './userPosts';
import UserHistory from './history/userHistory';
import './userPage.scss';

const UserPage = () => {

    const [page, setPage] = useState<UserPageType>(UserPageType.Posts);
    const [isPostFieldActive, setIsPostFieldActive] = useState(false);
    const { isLoading } = useContext(WebContext);
    const [ histories, setHistories ] = useState<History[]>([]);

    const closeAll = () => {
        if (!isLoading) {
            setIsPostFieldActive(false);
        }
    }

    return (
        <div className="default-gesture" onClick={closeAll}>
            <UserPageContext.Provider value={{
                    page, switchPage: setPage, 
                    isPostFieldActive, setIsPostFieldActive}}>
                <UserHeader histories={histories} setHistories={(histories: History[]) => setHistories(histories)}/>
                { page === UserPageType.Posts? <UserPosts /> : page === UserPageType.History? <UserHistory histories={histories}/> : <div></div>}
            </UserPageContext.Provider>
        </div>
    );
};

export default UserPage;