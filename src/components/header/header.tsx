import { useContext, useState } from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { WebContext } from '../../context/WebContext';
import { DEFAULT_POST_KARMA } from '../../config';
import './header.scss';

const Header = () => {
    const history = useHistory();
    const location = useLocation();
    const { user, isLoading, isMenuOpen, setIsMenuOpen } = useContext(WebContext);
    const [searchInput, setSearchInput] = useState<string>("");

    const gotoNewPage = () => {
        if (!isLoading && user !== null && (user.reputation - user.spent) >= DEFAULT_POST_KARMA) {
            history.push(`/new`, {isConfirmed: true});
        }
    }

    const gotoUserPage = () => {
        history.push(`/user`, {isConfirmed: true});
    }

    const openMenu = () => {
        if (!isMenuOpen && !isLoading) {
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
                    <img src={require('../../../public/images/unirep-title.svg')} />
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
                    <div id="rep" onClick={gotoUserPage}><img src={require('../../../public/images/lighting.svg')}/>{user?.reputation - user?.spent}</div>
                    <div id="new" className={location.pathname === '/new'? "navBtn chosen" : "navBtn"}><img src={require('../../../public/images/newpost.svg')} onClick={gotoNewPage} /></div>
                    <div id="user" className={location.pathname === '/user'? "navBtn chosen" : "navBtn"}><img src={require('../../../public/images/user.svg')} onClick={gotoUserPage} /></div>
                    <div className="navBtn"><img src={require('../../../public/images/menu.svg')} onClick={openMenu} /></div>
                </div> :
                <div className="navButtons">
                    <div id="login" className="whiteButton" onClick={() => history.push('/login')}>Sign in</div>
                    <div id="join" className="blackButton" onClick={() => history.push('/signup')}>Join</div>
                    <div id="menu" className="navBtn"><img src={require('../../../public/images/menu.svg')} onClick={openMenu} /></div>
                </div>
                
            }   
        </header>
    );
}

export default Header;
