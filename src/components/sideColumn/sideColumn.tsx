import { useContext } from 'react'
import { useHistory } from 'react-router-dom'

import './sideColumn.scss'
import { WebContext } from '../../context/WebContext'
import DefaultWidget from './defaultWidget'
import UserInfoWidget from './userInfoWidget'
import ReminderWidget from './reminderWidget'
import PostsWidget from './postsWidget'
import { Page } from '../../constants'

type Props = {
    page: Page
}

const SideColumn = ({ page }: Props) => {
    const { user } = useContext(WebContext)
    const history = useHistory()

    const gotoSetting = () => {
        if (user !== null) {
            history.push('/setting', { isConfirmed: true })
        }
    }

    return (
        <div>
            {page === Page.Setting ? (
                <div className="margin-top widget"></div>
            ) : (
                <div></div>
            )}
            {page === Page.User ? (
                <div className="setting widget">
                    <img
                        src={require('../../../public/images/setting.svg')}
                        onClick={gotoSetting}
                    />
                </div>
            ) : (
                <div></div>
            )}
            {user !== null && page !== Page.Setting ? (
                <UserInfoWidget />
            ) : (
                <div></div>
            )}
            {user !== null && (page === Page.New || page === Page.Post) ? (
                <ReminderWidget page={page} />
            ) : (
                <div></div>
            )}
            {user !== null && page === Page.User ? (
                <PostsWidget />
            ) : (
                <div></div>
            )}
            <DefaultWidget />
            <div className="back-to-top" onClick={() => window.scrollTo(0, 0)}>
                Back to top
            </div>
        </div>
    )
}

export default SideColumn
