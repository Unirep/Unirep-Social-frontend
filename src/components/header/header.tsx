import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { WebContext } from '../../context/WebContext';
import * as Constants from '../../constants';
import { userStateTransition, getNextEpochTime, getEpochKeys, getAirdrop, getUserState } from '../../utils';
import './header.scss';

const Header = () => {
    const history = useHistory();
    const [isUSTing, setIsUSTing] = useState(false);
    const { user, setUser, shownPosts, setShownPosts, isLoading, setIsLoading, nextUSTTime, setNextUSTTime, isMenuOpen, setIsMenuOpen } = useContext(WebContext);
    const [searchInput, setSearchInput] = useState<string>("");

    const doUST = async () => {
        if (user !== null) {
            setIsUSTing(true);
            setIsLoading(true);
            const ret = await userStateTransition(user.identity);
            console.log(ret);
            
            const userStateResult = await getUserState(user.identity);
            const epks = await getEpochKeys(user.identity, userStateResult.currentEpoch);
            const rep = userStateResult.userState.getRepByAttester(userStateResult.attesterId);
            if (ret !== undefined) {
                setUser({...user, epoch_keys: epks, reputation: Number(rep.posRep) - Number(rep.negRep), current_epoch: ret.toEpoch, userState: userStateResult.userState, spent: 0})
            }
            await getAirdrop(user.identity, userStateResult.userState);
            const next = await getNextEpochTime();
            setNextUSTTime(next);

            setIsUSTing(false);
            setIsLoading(false);
        }
        return;
    }

    const makeCountdownText = () => {
        if (user === null) return '';
        
        const diff = (nextUSTTime - Date.now()) / 1000; // change to seconds instead of milliseconds
        
        if (diff >= 0) {
            const days = Math.floor(diff / (60 * 60 * 24));
            const hours = Math.floor((diff / (60 * 60)) % 24);
            const minutes = Math.floor((diff / 60) % 60);
            const seconds = Math.floor(diff % 60);
            
            const ret = days + 'd:' + hours + 'h:' + minutes + 'm:' + seconds + 's';
            return ret;
        } else {
            if (!isUSTing) {
                doUST();
            }
            return 'processing user state transition...' + Math.floor((Date.now() - nextUSTTime) / 1000) + 's';
        }
    }

    const [countdownText, setCountdownText] = useState(makeCountdownText());

    useEffect(
        () => {
            const timer = setTimeout(() => {
                setCountdownText(makeCountdownText());
            }, 1000);

            return () => clearTimeout(timer);
        }
    );

    // const signUp = () => {
    //     if (!isLoading) {
    //         console.log('open sign up! set ' + Constants.PageStatus.SignUp);
    //         setPageStatus(Constants.PageStatus.SignUp);
    //     }  
    // }

    // const signIn = () => {
    //     if (!isLoading) {
    //         console.log('open sign in! set ' + Constants.PageStatus.SignIn);
    //         setPageStatus(Constants.PageStatus.SignIn);
    //     }   
    // }

    const logout = () => {
        if (!isLoading) {
            setUser(null);
            setShownPosts([...shownPosts].map(p => {
                const commentsLogout = p.comments.map(c => {
                    return {...c, isUpvoted: false, isDownvoted: false, isAuthor: false};
                });
                return {...p, isUpvoted: false, isDownvoted: false, isAuthor: false, comments: commentsLogout};
            }));
            setNextUSTTime(4789220745000);
            history.push(`/`);
        }
    }

    const gotoNewPage = () => {
        if (!isLoading) {
            history.push(`/new`);
        }
    }

    const gotoUserPage = () => {
        if (!isLoading) {
            history.push(`/user`);
        }
    }

    const openMenu = () => {
        if (!isMenuOpen) {
            console.log('open menu!');
            setIsMenuOpen(true);
        }
    }

    const handleSearchInput = (event: any) => {
        console.log("search input : " + event.target.value);
    }

    return (
        <header>
            <div className="navLinks">
                <NavLink to="/" className="link" activeClassName="active" exact>
                    <img src="/images/unirep-title.svg" />
                </NavLink>
            </div>
            {/* <div className="search-bar">
                <div className="search-icon"><FaSearch /></div>
                <form>
                    <input type="text" name="searchInput" placeholder="Search by keyword, user names or epoch key" onChange={handleSearchInput} />
                </form>
            </div> */}
            {/* <div className="timer">{countdownText}</div> */}
            {user && user.identity? 
                <div className="navButtons">
                    {/* <div className={isLoading? "whiteButton disabled" : "whiteButton"} onClick={gotoUserPage}>
                        <img src="/images/user-purple.png" />
                        <span>{user.reputation - user.spent}</span>
                    </div>
                    <div className={isLoading? "whiteButton disabled" : "whiteButton"} onClick={logout}>Log out</div> */}
                    <img src="/images/newpost.png" onClick={gotoNewPage} />
                    <img src="/images/user.png" onClick={gotoUserPage} />
                    <img src="/images/menu.png" onClick={openMenu} />
                </div> :
                <div className="navButtons">
                    <div className="whiteButton" onClick={() => history.push('/login')}>Sign in</div>
                    <div className="blackButton" onClick={() => history.push('/signup')}>Join</div>
                    <img src="/images/menu.png" onClick={openMenu} />
                </div>
                
            }   
        </header>
    );
}

export default Header;