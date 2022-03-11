import { useHistory, useLocation } from 'react-router-dom';

import './settingPage.scss';

import SideColumn from '../sideColumn/sideColumn';
import { Page } from '../../constants';
import PrivateKey from './privateKey';


const SettingPage = () => {
    const history = useHistory();
    const location = useLocation<Location>();
    const state = JSON.parse(JSON.stringify(location.state));
    const isConfirmed = state.isConfirmed;

    return (
        <div className="body-columns">
            <div className="margin-box"></div>
            <div className="content">
                <div className="main-content">
                    <div className="back" onClick={() => history.push('/user', {isConfirmed: true})}><img src="/images/arrow-left.svg" /></div>
                    <PrivateKey />
                </div>
                <div className="side-content">
                    <SideColumn page={Page.Setting} />
                </div>
            </div>
            <div className="margin-box"></div>
        </div>
    );
}

export default SettingPage;