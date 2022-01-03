import { useContext } from 'react';

import './sideColumn.scss';
import { WebContext } from '../../context/WebContext';
import DefaultWidget from './defaultWidget';
import UserInfoWidget from './userInfoWidget';
import ReminderWidget from './reminderWidget';
import { Page } from '../../constants';

type Props = {
    page: Page
}

const SideColumn = ( { page }: Props) => {
    const { user } = useContext(WebContext);

    const gotoSetting = () => {
        if (user !== null) {

        }
    }

    return (
        <div>
            {page === Page.User? <div className="setting widget"><img src="/images/setting.png" onClick={gotoSetting} /></div> : <div></div>}
            {user !== null && page !== Page.User? <UserInfoWidget /> : <div></div>}
            {user !== null && page === Page.New? <ReminderWidget /> : <div></div>}
            <DefaultWidget />
            <div className="back-to-top" onClick={() => window.scrollTo(0, 0)}>Back to top</div>
        </div>
    );
}

export default SideColumn;