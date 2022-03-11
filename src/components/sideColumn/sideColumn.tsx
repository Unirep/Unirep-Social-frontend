import { useHistory } from 'react-router-dom';

import './sideColumn.scss';
import { useAuth } from '../../context/AuthContext';

import DefaultWidget from './defaultWidget';
import UserInfoWidget from './userInfoWidget';
import ReminderWidget from './reminderWidget';
import PostsWidget from './postsWidget';
import { Page } from '../../constants';

const SideColumn = () => {
    const { user } = useAuth();
    const history = useHistory();

    const page = window.location.pathname;

    const gotoSetting = () => {
        if (user !== null) {
            history.push('/setting', {isConfirmed: true});
        }
    }

    return (
        <div>
            {page === Page.Setting? <div className="margin-top widget"></div> : <div></div>}
            {page === Page.User? <div className="setting widget"><img src="/images/setting.svg" onClick={gotoSetting} /></div> : <div></div>}
            {user !== null && page !== Page.Setting? <UserInfoWidget /> : <div></div>}
            {user !== null && (page === Page.New || page === Page.Post)? <ReminderWidget page={page} /> : <div></div>}
            {user !== null && page === Page.User? <PostsWidget /> : <div></div>}
            <DefaultWidget />
            <div className="back-to-top" onClick={() => window.scrollTo(0, 0)}>Back to top</div>
        </div>
    );
}

export default SideColumn;