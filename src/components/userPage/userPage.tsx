import { useContext, useState, useEffect } from 'react';

import { getPostsByQuery, getRecords, getCommentsByQuery } from '../../utils';
import { WebContext } from '../../context/WebContext';
import SideColumn from '../sideColumn/sideColumn';
import { History, ActionType, Page, QueryType, Post, Comment } from '../../constants';
import ActivityWidget from './activityWidget';
import PostsList from '../postsList/postsList';
import CommentsList from '../postsList/commentsList';
import './userPage.scss';

enum Tag {
    Posts = "Posts",
    Comments = "Comments",
    Activity = "Activity"
}

const UserPage = () => {
    const { isLoading, user } = useContext(WebContext);
    const [ histories, setHistories ] = useState<History[]>([]);
    const [ tag, setTag ] = useState<Tag>(Tag.Posts);
    const [ sort, setSort ] = useState<QueryType>(QueryType.Boost);
    const [ isDropdown, setIsDropdown ] = useState<boolean>(false);
    const [ myPosts, setMyPosts ] = useState<Post[]>([]);
    const [ myComments, setMyComments ] = useState<Comment[]>([]);

    const [ received, setReceived ] = useState<number[]>([0, 0, 0]); // airdrop, boost, squash
    const [ spent, setSpent ] = useState<number[]>([0, 0, 0, 0]); // post, comment, boost, squash

    const closeAll = () => {
        if (!isLoading) {}
    }

    const getUserPosts = async (sort: QueryType, lastRead: string = '0') => { 
        const ret = await getPostsByQuery(sort, lastRead, user? user.all_epoch_keys : []);
        if (lastRead !== '0') {
            setMyPosts([...myPosts, ...ret]);
        } else {
            setMyPosts(ret);
        }
        console.log(ret);
    }

    const getUserComments = async (sort: QueryType, lastRead: string = '0') => { 
        const ret = await getCommentsByQuery(sort, lastRead, user? user.all_epoch_keys : []);
        if (lastRead !== '0') {
            setMyComments([...myComments, ...ret]);
        } else {
            setMyComments(ret);
        }
        console.log(ret);
    }
    
    const getUserRecords = async () => { 
        if (user !== null) {
            const ret = await getRecords(user.current_epoch, user.identity);
            setHistories(ret);
            resortRecords(QueryType.New, ret);
            let r: number[] = [0, 0, 0];
            let s: number[] = [0, 0, 0, 0];
            
            ret.forEach(h => {
                const isReceived = user.epoch_keys.indexOf(h.to) !== -1;
                const isSpent = user.epoch_keys.indexOf(h.from) !== -1;
                if (isReceived) {
                    // console.log(h.to + 'is receiver, is me, ' + h.upvote);
                    // right stuff
                    if (h.action === ActionType.UST) {
                        r[0] += h.upvote;
                    } else if (h.action === ActionType.Vote) {
                        r[1] += h.upvote;
                        r[2] += h.downvote;
                    }
                } 

                if (isSpent) {
                    // console.log(h.from + 'is giver, is me, ' + h.downvote);
                    if (h.action === ActionType.Post) {
                        s[0] += h.downvote;
                    } else if (h.action === ActionType.Comment) {
                        s[1] += h.downvote;
                    } else if (h.action === ActionType.Vote) {
                        s[2] += h.upvote;
                        s[3] += h.downvote;
                    }
                }
            });
            setReceived(r);
            setSpent(s);
        }
    }

    const resortRecords = (s: QueryType, hs: History[]) => {
        if (s === QueryType.New) {
            hs.sort((a, b) => a.time > b.time? -1 : 1);
        } else if (s === QueryType.Rep) {
            hs.sort((a, b) => a.upvote + a.downvote > b.upvote + b.downvote? -1 : 1);
        }
        setHistories(hs);
    }

    useEffect (() => {
        const getUserData = async () => {
            console.log('get my posts');
            await getUserPosts(sort);
            console.log('get my comments');
            await getUserComments(sort);
            console.log('get history');
            await getUserRecords();
        }

        getUserData();

    }, []);

    const switchDropdown = () => {
        if (isDropdown) {
            setIsDropdown(false);
        } else {
            setIsDropdown(true);
        }
    }

    const setTagPage = (tag: Tag) => {
        setTag(tag);
        if (tag === Tag.Activity) {
            setSort(QueryType.New);
        } else {
            setSort(QueryType.Boost);
        }
    }

    const setSortType = async (s: QueryType) => {
        setSort(s);
        if (tag === Tag.Posts || tag === Tag.Comments) {
            await getUserPosts(s);
            await getUserComments(s);
        } else {
            resortRecords(s, histories);
        }
        
        setIsDropdown(false);
    }

    const loadMorePosts = async () => {
        if (myPosts.length > 0) {
            await getUserPosts(sort, myPosts[myPosts.length-1].id);
        } else {
            await getUserPosts(sort);
        }
    }

    const loadMoreComments = async () => {
        if (myComments.length > 0) {
            await getUserComments(sort, myComments[myComments.length-1].id);
        } else {
            await getUserComments(sort);
        }
    }

    return (
        <div className="wrapper">
            <div className="default-gesture" onClick={closeAll}>
                <div className="margin-box"></div>
                { user !== null? 
                    <div className="main-content">
                        <h3>My Stuff</h3> 
                        <div className="my-stuff">
                            <div className="my-reps stuff">
                                <div className="white-block">
                                    <p>My Reps</p>
                                    <div className="rep-info"><img src="/images/lighting.svg" />{user.reputation - user.spent}</div>
                                </div>
                                <div className="grey-block">
                                    <span>How I use my rep in this epoch</span><br/>
                                    <div className="rep-bar">
                                        { 
                                            spent.map((s, i) => <div className="rep-portion" style={{"width": `${s / user.reputation * 100}%`}} key={i}></div>)
                                        }
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
                                        <span><img src="/images/unirep.svg" />System drop</span>
                                        <p>+{received[0]}</p>
                                    </div>
                                    <div className="received-info">
                                        <span><img src="/images/boost.svg" />Boost</span>
                                        <p>+{received[1]}</p>
                                    </div>
                                    <div className="received-info">
                                        <span><img src="/images/squash.svg" />Squash</span>
                                        <p>-{received[2]}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="user-page-header">
                            <div className="tags">
                                <div className={tag === Tag.Posts? "tag underline" : "tag"} onClick={() => setTagPage(Tag.Posts)}>Posts</div>
                                <div className="line"></div>
                                <div className={tag === Tag.Comments? "tag underline" : "tag"} onClick={() => setTagPage(Tag.Comments)}>Comments</div>
                                <div className="line"></div>
                                <div className={tag === Tag.Activity? "tag underline" : "tag"} onClick={() => setTagPage(Tag.Activity)}>Activity</div>
                            </div>
                            {
                                isDropdown? 
                                    tag !== Tag.Activity?
                                        <div className="dropdown isDropdown" onClick={switchDropdown} style={{height: `${40*3}px`}}>
                                            <div className="menu-choice" onClick={() => setSortType(QueryType.Boost)}><img src="/images/boost-fill.svg"/>Boost</div>
                                            <div className="menu-choice" onClick={() => setSortType(QueryType.New)}><img src="/images/new-fill.svg"/>New</div>
                                            <div className="menu-choice" onClick={() => setSortType(QueryType.Squash)}><img src="/images/squash-fill.svg"/>Squash</div>
                                        </div> : 
                                        <div className="dropdown isDropdown" onClick={switchDropdown} style={{height: `${40*2}px`}}>
                                            <div className="menu-choice" onClick={() => setSortType(QueryType.New)}><img src="/images/new-fill.svg"/>New</div>
                                            <div className="menu-choice" onClick={() => setSortType(QueryType.Rep)}><img src="/images/unirep-fill.svg"/>Rep</div>
                                        </div> :
                                    <div className="dropdown" onClick={switchDropdown}>
                                        <div className="menu-choice isChosen">
                                            <img src={`/images/${sort === QueryType.Rep? 'unirep' : sort}-fill.svg`}/>
                                            <span>{sort.charAt(0).toUpperCase() + sort.slice(1)}</span>
                                            <img src="/images/arrow-down.svg" />
                                        </div>
                                    </div>
                                    
                            }
                        </div> 
                        <div className="user-page-content">
                            {
                                tag === Tag.Posts? 
                                    <PostsList 
                                        posts={myPosts}
                                        loadMorePosts={loadMorePosts}
                                    /> : tag === Tag.Comments?
                                    <CommentsList 
                                        comments={myComments}
                                        page={Page.User}
                                        loadMoreComments={loadMoreComments}
                                    /> : <div>
                                        {
                                            histories.map((h, i) => 
                                                <ActivityWidget 
                                                    key={i} 
                                                    history={h}
                                                    isSpent={user.all_epoch_keys.indexOf(h.from) !== -1}
                                                />
                                            )
                                        }
                                    </div>
                            }   
                        </div>
                    </div> : <div></div> 
                }
                { user !== null? 
                    <div className="side-content">
                        <SideColumn page={Page.User} />
                    </div> : <div></div>
                }
                
                <div className="margin-box"></div>
            </div>
        </div>
    );
};

export default UserPage;