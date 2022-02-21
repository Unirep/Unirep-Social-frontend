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
import FeedbackPage from './components/feedbackPage/feedbackPage';
import AdminPage from './components/adminPage/adminPage';
import SettingPage from './components/settingPage/settingPage';

import { WebContext } from './context/WebContext';

const AppRouter = () => {

    const [user, setUser] = useLocalStorage('user', null);
    const [shownPosts, setShownPosts] = useState<Constants.Post[]>([]);
    const [nextUSTTime, setNextUSTTime] = useLocalStorage('nextUSTTime', 4789220745000);
    const [adminCode, setAdminCode] = useLocalStorage('admin', '');
    const [draft, setDraft] = useLocalStorage('draft', null);
    const [isLoading, setIsLoading] = useLocalStorage('isLoading' ,false);
    const [action, setAction] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [page, setPage] = useState(Constants.Page.Home);
    
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
                    action, setAction,
                    adminCode, setAdminCode,
                    draft, setDraft}}>
                <Header />
                
                <Switch>
                    <Route component={MainPage} path="/" exact={true} />
                    <Route component={PostPage} path="/post/:id" />
                    <Route component={UserPage} path="/user" />
                    <Route component={HelpPage} path="/help" />
                    <Route component={LoginPage} path="/login" />
                    <Route component={SignupPage} path="/signup" />
                    <Route component={NewPage} path="/new" />
                    <Route component={FeedbackPage} path="/feedback" />
                    <Route component={AdminPage} path="/admin" />
                    <Route component={SettingPage} path="/setting" />
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