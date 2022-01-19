import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { useState } from 'react';

import useLocalStorage from './useLocalStorage';
import * as Constants from './constants';

import Header from './components/header/header';
import LoadingWidget from './components/loadingWidget/loadingWidget';
import Overlay from './components/overlay/overlay';
import MainPage from './components/mainPage/mainPage';
import PostPage from './components/postPage/postPage';
import UserPage from './components/userPage/userPage';
import HelpPage from './components/helpPage/helpPage';
import LoginPage from './components/loginPage/loginPage';
import SignupPage from './components/signupPage/signupPage';
import NewPage from './components/newPage/newPage';

import { WebContext } from './context/WebContext';

const AppRouter = () => {

    const [user, setUser] = useLocalStorage(Constants.userKey, null);
    const [shownPosts, setShownPosts] = useLocalStorage(Constants.shownPostsKey, []);
    const [nextUSTTime, setNextUSTTime] = useLocalStorage(Constants.nextUSTKey, 4789220745000);
    const [isLoading, setIsLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [page, setPage] = useState(Constants.Page.Home);
    const [action, setAction] = useState<any>(null);

    return (
        <BrowserRouter>
            <div>
            <WebContext.Provider value={{
                    user, setUser,
                    shownPosts, setShownPosts, 
                    isLoading, setIsLoading,
                    nextUSTTime, setNextUSTTime,
                    isMenuOpen, setIsMenuOpen,
                    page, setPage,
                    action, setAction}}>
                <Header />
                
                <Switch>
                    <Route component={MainPage} path="/" exact={true} />
                    <Route component={PostPage} path="/post/:id" />
                    <Route component={UserPage} path="/user" />
                    <Route component={HelpPage} path="/help" />
                    <Route component={LoginPage} path="/login" />
                    <Route component={SignupPage} path="/signup" />
                    <Route component={NewPage} path="/new" />
                    <Route component={() => <Redirect to="/" />} />
                </Switch>

                <LoadingWidget />

                {isMenuOpen? 
                    <Overlay /> : <div></div>
                }
            </WebContext.Provider>
            </div>
        </BrowserRouter>
    );
};

export default AppRouter;