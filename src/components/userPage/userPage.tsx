import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import './userPage.scss';
import { useAuth } from '../../context/AuthContext';

import BasicPage from '../basicPage/basicPage';
import { getPostsByQuery, getRecords, getCommentsByQuery } from '../../utils';
import { Record, ActionType, Page, QueryType, Post, Comment } from '../../constants';
import ActivityWidget from './activityWidget';
import PostsList from '../postsList/postsList';
import CommentsList from '../postsList/commentsList';


enum Tag {
    Posts = "Posts",
    Comments = "Comments",
    Activity = "Activity"
}

type Props = {
    spent: number,
    total: number,
    action: number,
}

const RepPortion = ({ spent, total, action } : Props) => {
    const [isHover, setHover] = useState<boolean>(false);
    const portionName = action === 2? 'Boost' : action === 3? 'Squash' : action === 0? 'Post' : 'Comment';
    
    return (
        <div className="rep-portion" 
            style={{width: `${spent / total * 100}%`}}
            onMouseEnter={() => setHover(true)} 
            onMouseOut={() => setHover(false)}
            onClick={() => setHover(!isHover)}>
            {isHover? 
                <div className="rep-description">
                    <img src={`/images/${portionName === 'Post' || portionName === 'Comment'? 'unirep': portionName.toLowerCase()}-white.svg`} />
                    {portionName}:
                    <span>{spent}</span>
                </div> : <div></div>
            }
        </div>
    );
}

const UserPage = () => {
    const location = useLocation<Location>();
    const state = JSON.parse(JSON.stringify(location.state));
    const isConfirmed = state.isConfirmed;

    const { user } = useAuth();
    const [ records, setRecords ] = useState<Record[]>([]);
    const [ tag, setTag ] = useState<Tag>(Tag.Posts);
    const [ sort, setSort ] = useState<QueryType>(QueryType.Boost);
    const [ isDropdown, setIsDropdown ] = useState<boolean>(false);
    const [ myPosts, setMyPosts ] = useState<Post[]>([]);
    const [ myComments, setMyComments ] = useState<Comment[]>([]);

    const [ received, setReceived ] = useState<number[]>([0, 0, 0]); // airdrop, boost, squash
    const [ spent, setSpent ] = useState<number[]>([0, 0, 0, 0]); // post, comment, boost, squash

    const getUserPosts = async (sort: QueryType, lastRead: string = '0') => { 
        const ret = await getPostsByQuery(sort, lastRead, user? user.all_epoch_keys : []);
        if (lastRead !== '0') {
            setMyPosts([...myPosts, ...ret]);
        } else {
            setMyPosts(ret);
        }
    }

    const getUserComments = async (sort: QueryType, lastRead: string = '0') => { 
        const ret = await getCommentsByQuery(sort, lastRead, user? user.all_epoch_keys : []);
        if (lastRead !== '0') {
            setMyComments([...myComments, ...ret]);
        } else {
            setMyComments(ret);
        }
    }
    
    const getUserRecords = async () => { 
        if (user !== null) {
            const ret = await getRecords(user.current_epoch, user.identity);
            setRecords(ret);
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

    const resortRecords = (s: QueryType, hs: Record[]) => {
        if (s === QueryType.New) {
            hs.sort((a, b) => a.time > b.time? -1 : 1);
        } else if (s === QueryType.Rep) {
            hs.sort((a, b) => a.upvote + a.downvote > b.upvote + b.downvote? -1 : 1);
        }
        setRecords(hs);
    }

    useEffect (() => {
        const getUserData = async () => {
            console.log('get my posts');
            await getUserPosts(sort);
            console.log('get my comments');
            await getUserComments(sort);
            console.log('get records');
            await getUserRecords();
        }

        getUserData();

    }, []);

    useEffect(() => {
        console.log('Is this user page being confirmed? ' + isConfirmed);
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
            resortRecords(s, records);
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
        <BasicPage>
            { user !== null? 
                <div className="main-content">
                    <h3>My Stuff</h3> 
                    <div className="my-stuff">
                        <div className="my-reps stuff">
                            <div className="white-block">
                                <p>My Rep</p>
                                <div className="rep-info"><img src="/images/lighting.svg" />{user.reputation - user.spent}</div>
                            </div>
                            <div className="grey-block">
                                <span>How I use my rep in this cycle</span><br/>
                                <div className="rep-bar">
                                    { 
                                        spent.map((s, i) => <RepPortion spent={s} total={user.reputation} action={i} key={i} />)
                                    }
                                </div>
                            </div>
                        </div>
                        <div style={{"width": "16px"}}></div>
                        <div className="received stuff">
                            <div className="grey-block">
                                <p>Received</p>
                                <div className="rep-received">{received[0] + received[1] - received[2]}</div>
                                <span>This Rep is in the vault. It will be yours in the next cycle.</span>
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
                        <div className="tags header-child">
                            <div className={tag === Tag.Posts? "tag underline" : "tag"} onClick={() => setTagPage(Tag.Posts)}>Posts</div>
                            <div className="line"></div>
                            <div className={tag === Tag.Comments? "tag underline" : "tag"} onClick={() => setTagPage(Tag.Comments)}>Comments</div>
                            <div className="line"></div>
                            <div className={tag === Tag.Activity? "tag underline" : "tag"} onClick={() => setTagPage(Tag.Activity)}>Activity</div>
                        </div>
                        {
                            isDropdown? 
                                tag !== Tag.Activity?
                                    <div className="dropdown isDropdown header-child" onClick={switchDropdown} style={{height: `${40*3}px`}}>
                                        <div className="menu-choice" onClick={() => setSortType(QueryType.Boost)}><img src="/images/boost-fill.svg"/>Boost</div>
                                        <div className="menu-choice" onClick={() => setSortType(QueryType.New)}><img src="/images/new-fill.svg"/>New</div>
                                        <div className="menu-choice" onClick={() => setSortType(QueryType.Squash)}><img src="/images/squash-fill.svg"/>Squash</div>
                                    </div> : 
                                    <div className="dropdown isDropdown header-child" onClick={switchDropdown} style={{height: `${40*2}px`}}>
                                        <div className="menu-choice" onClick={() => setSortType(QueryType.New)}><img src="/images/new-fill.svg"/>New</div>
                                        <div className="menu-choice" onClick={() => setSortType(QueryType.Rep)}><img src="/images/unirep-fill.svg"/>Rep</div>
                                    </div> :
                                <div className="dropdown header-child" onClick={switchDropdown}>
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
                                        records.map((h, i) => 
                                            <ActivityWidget 
                                                key={i} 
                                                record={h}
                                                isSpent={user.all_epoch_keys.indexOf(h.from) !== -1}
                                            />
                                        )
                                    }
                                </div>
                        }   
                    </div>
                </div> : <div></div> 
            }
        </BasicPage>
    );
};

export default UserPage;