import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { useState } from 'react';

import useLocalStorage from './hooks/useLocalStorage';

import Header from './components/header/header';
import MainPage from './components/mainPage/mainPage';
import PostPage from './components/postPage/postPage';
import UserPage from './components/userPage/userPage';
import LoginPage from './components/loginPage/loginPage';
import SignupPage from './components/signupPage/signupPage';
import NewPage from './components/newPage/newPage';
import FeedbackPage from './components/feedbackPage/feedbackPage';
import AdminPage from './components/adminPage/adminPage';
import SettingPage from './components/settingPage/settingPage';

import { WebContext } from './context/WebContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

const AppRouter = () => {
    const [shownPosts, setShownPosts] = useLocalStorage('shownPosts', []);
    const [nextUSTTime, setNextUSTTime] = useLocalStorage('nextUSTTime', 4789220745000);
    const [adminCode, setAdminCode] = useLocalStorage('admin', '');
    const [draft, setDraft] = useLocalStorage('draft', null);
    const [action, setAction] = useState<any>(null);
    
    return (
        <BrowserRouter>
            <AppProvider>
                <AuthProvider currentUser={null}>
                <WebContext.Provider value={{
                        shownPosts, setShownPosts, 
                        nextUSTTime, setNextUSTTime,
                        action, setAction,
                        adminCode, setAdminCode,
                        draft, setDraft}}>
                    <Header />
                    
                    <Switch>
                        <Route component={MainPage} path="/" exact={true} />
                        <Route component={PostPage} path="/post/:id" />
                        <Route component={UserPage} path="/user" />
                        <Route component={LoginPage} path="/login" />
                        <Route component={SignupPage} path="/signup" />
                        <Route component={NewPage} path="/new" />
                        <Route component={FeedbackPage} path="/feedback" />
                        <Route component={AdminPage} path="/admin" />
                        <Route component={SettingPage} path="/setting" />
                        <Route component={() => <Redirect to="/" />} />
                    </Switch>
                </WebContext.Provider>
                </AuthProvider>
            </AppProvider>
        </BrowserRouter>
    );
};

export default AppRouter;