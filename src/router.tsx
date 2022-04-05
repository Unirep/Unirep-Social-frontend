import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { useState } from 'react'

import useLocalStorage from './hooks/useLocalStorage'
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
    const [tx, setTx] = useLocalStorage('tx', '')

    const [adminCode, setAdminCode] = useLocalStorage('admin', '')
    const [draft, setDraft] = useLocalStorage('draft', null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [page, setPage] = useState(Constants.Page.Home)

    return (
        <BrowserRouter>
            <div>
                <WebContext.Provider
                    value={{
                        tx,
                        setTx,
                        isMenuOpen,
                        setIsMenuOpen,
                        page,
                        setPage,
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
