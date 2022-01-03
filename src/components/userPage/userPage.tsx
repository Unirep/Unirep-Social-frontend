import React, { useContext, useState, useEffect } from 'react';
import { getRecords } from '../../utils';
import { WebContext } from '../../context/WebContext';
import SideColumn from '../sideColumn/sideColumn';
import { UserPageContext } from '../../context/UserPageContext';
import { UserPageType, History, ActionType, Page } from '../../constants';
import UserHeader from './userHeader';
import UserPosts from './userPosts';
import UserHistory from './history/userHistory';
import './userPage.scss';

const UserPage = () => {

    const [page, setPage] = useState<UserPageType>(UserPageType.Posts);
    const [isPostFieldActive, setIsPostFieldActive] = useState(false);
    const { isLoading, user } = useContext(WebContext);
    const [ histories, setHistories ] = useState<History[]>([]);
    const [ received, setReceived ] = useState<number[]>([0, 0, 0]); // airdrop, boost, squash

    const closeAll = () => {
        if (!isLoading) {
            setIsPostFieldActive(false);
        }
    }

    useEffect (() => {
        
        const getHistory = async () => {
            if (user !== null) {
                const ret = await getRecords(user.current_epoch, user.identity);
                setHistories(ret);
                let r: number[] = [0, 0, 0];
                ret.forEach(h => {
                    const isReceived = user.all_epoch_keys.indexOf(h.from) === -1;
                    if (isReceived) {
                        if (h.action === ActionType.UST) {
                            r[0] += h.upvote;
                        } else if (h.action === ActionType.Vote) {
                            r[1] += h.upvote;
                            r[2] += h.downvote;
                        }
                    }
                });
                setReceived(r);
            }
        }

        getHistory();
        
    }, []);

    return (
        <div className="wrapper">
            <div className="default-gesture" onClick={closeAll}>
                {/* <UserPageContext.Provider value={{
                        page, switchPage: setPage, 
                        isPostFieldActive, setIsPostFieldActive}}>
                    <UserHeader histories={histories} setHistories={(histories: History[]) => setHistories(histories)}/>
                    { page === UserPageType.Posts? <UserPosts /> : page === UserPageType.History? <UserHistory histories={histories}/> : <div></div>}
                </UserPageContext.Provider> */}
                <div className="margin-box"></div>
                { user !== null? 
                    <div className="main-content">
                        <h3>My Stuff</h3> 
                        <div className="my-stuff">
                            <div className="my-reps stuff">
                                <div className="white-block">
                                    <p>My Reps</p>
                                    <div className="rep-info"><img src="/images/lighting-black.png" />{user.reputation}</div>
                                </div>
                                <div className="grey-block">
                                    <span>How I use my rep in this epoch</span><br/>
                                    <div className="rep-bar">
                                        <div className="rep-portion" style={{"width": "10%"}}></div>
                                        <div className="rep-portion" style={{"width": "20%"}}></div>
                                    </div>
                                </div>
                            </div>
                            <div style={{"width": "16px"}}></div>
                            <div className="received stuff">
                                <div className="grey-block">
                                    <p>Received</p>
                                    <div className="rep-received">{received[0] + received[1] - received[2]}</div>
                                    <span>These Reps are in the vault now, it will release to you in next epoch.</span>
                                </div>
                                <div className="white-block">
                                    <div className="received-info">
                                        <span><img src="/images/airdrop-white.png" />System drop</span>
                                        <p>+{received[0]}</p>
                                    </div>
                                    <div className="received-info">
                                        <span><img src="/images/boost-white.png" />Boost</span>
                                        <p>+{received[1]}</p>
                                    </div>
                                    <div className="received-info">
                                        <span><img src="/images/squash-white.png" />Squash</span>
                                        <p>-{received[2]}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : <div></div>
                }
                { user !== null? 
                    <div className="side-content">
                        <SideColumn page={Page.User}/>
                    </div> : <div></div>
                }
                
                <div className="margin-box"></div>
            </div>
        </div>
    );
};

export default UserPage;