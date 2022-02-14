import { useHistory, useLocation } from 'react-router-dom';
import { useContext } from 'react';

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
        <div className="wrapper">
            <div className="default-gesture">
                <div className="margin-box"></div>
                <div className="main-content">
                    <div className="back" onClick={() => history.push('/user', {isConfirmed: true})}><img src="/images/arrow-left.svg" /></div>
                    <PrivateKey />
                </div>
                <div className="side-content">
                    <SideColumn page={Page.Setting} />
                </div>
                <div className="margin-box"></div>
            </div>
        </div>
    );
}

export default SettingPage;