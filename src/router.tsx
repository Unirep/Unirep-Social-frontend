import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { useState } from 'react'

import useLocalStorage from './useLocalStorage'
import * as Constants from './constants'

import Header from './components/header/header'
import MainPage from './components/mainPage/mainPage'
import PostPage from './components/postPage/postPage'
import UserPage from './components/userPage/userPage'
import HelpPage from './components/helpPage/helpPage'
import LoginPage from './components/loginPage/loginPage'
import SignupPage from './components/signupPage/signupPage'
import NewPage from './components/newPage/newPage'
import FeedbackPage from './components/feedbackPage/feedbackPage'
import AdminPage from './components/adminPage/adminPage'
import SettingPage from './components/settingPage/settingPage'

import { WebContext } from './context/WebContext'

const AppRouter = () => {
    const [user, setUser] = useLocalStorage('user', null)
    const [tx, setTx] = useLocalStorage('tx', '')
    const [shownPosts, setShownPosts] = useLocalStorage('shownPosts', [])
    const [adminCode, setAdminCode] = useLocalStorage('admin', '')
    const [draft, setDraft] = useLocalStorage('draft', null)
    const [isLoading, setIsLoading] = useLocalStorage('isLoading', false)
    const [action, setAction] = useState<any>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [page, setPage] = useState(Constants.Page.Home)

    window.addEventListener('storage', (e) => {
        if (e.key === 'isLoading') {
            if (e.newValue === 'true') {
                setIsLoading(true)
            } else {
                setIsLoading(false)
            }
        }
    })

    return (
        <BrowserRouter>
            <div>
                <WebContext.Provider
                    value={{
                        user,
                        setUser,
                        tx,
                        setTx,
                        shownPosts,
                        setShownPosts,
                        isLoading,
                        setIsLoading,
                        isMenuOpen,
                        setIsMenuOpen,
                        page,
                        setPage,
                        action,
                        setAction,
                        adminCode,
                        setAdminCode,
                        draft,
                        setDraft,
                    }}
                >
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
                </WebContext.Provider>
            </div>
        </BrowserRouter>
    )
}

export default AppRouter
