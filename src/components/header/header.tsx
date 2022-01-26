import { useContext, useState } from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { WebContext } from '../../context/WebContext';
import { DEFAULT_POST_KARMA } from '../../config';
import './header.scss';

const Header = () => {
    const history = useHistory();
    const location = useLocation();
    const { user, setUser, shownPosts, setShownPosts, isLoading, setIsLoading, nextUSTTime, setNextUSTTime, isMenuOpen, setIsMenuOpen } = useContext(WebContext);
    const [searchInput, setSearchInput] = useState<string>("");

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
        if (!isLoading && user !== null && (user.reputation - user.spent) >= DEFAULT_POST_KARMA) {
            history.push(`/new`, {isConfirmed: true});
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

    const gotoHomePage = () => {
        if (!isLoading) {
        }
    }

    const handleSearchInput = (event: any) => {
        console.log("search input : " + event.target.value);
    }

    return (
        <header>
            <div className="navLinks">
                <NavLink to="/" className="link" activeClassName="active" onClick={gotoHomePage} exact>
                    <img src="/images/unirep-title.svg" />
                </NavLink>
            </div>
            {/* <div className="search-bar">
                <div className="search-icon"><FaSearch /></div>
                <form>
                    <input type="text" name="searchInput" placeholder="Search by keyword, user names or epoch key" onChange={handleSearchInput} />
                </form>
            </div> */}
            {user && user.identity? 
                <div className="navButtons">
                    <div className={location.pathname === '/new'? "navBtn chosen" : "navBtn"}><img src="/images/newpost.svg" onClick={gotoNewPage} /></div>
                    <div className={location.pathname === '/user'? "navBtn chosen" : "navBtn"}><img src="/images/user.svg" onClick={gotoUserPage} /></div>
                    <div className="navBtn"><img src="/images/menu.svg" onClick={openMenu} /></div>
                </div> :
                <div className="navButtons">
                    <div className="whiteButton" onClick={() => history.push('/login')}>Sign in</div>
                    <div className="blackButton" onClick={() => history.push('/signup')}>Join</div>
                    <div className="navBtn"><img src="/images/menu.svg" onClick={openMenu} /></div>
                </div>
                
            }   
        </header>
    );
}

export default Header;
