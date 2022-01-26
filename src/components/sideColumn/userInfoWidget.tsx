import { useContext, useEffect, useState } from 'react';
import dateformat from 'dateformat';

import { WebContext } from '../../context/WebContext';
import HelpWidget from '../helpWidget/helpWidget';
import { ActionType, InfoType } from '../../constants';

const UserInfoWidget = () => {
    const { user, nextUSTTime, action, setAction } = useContext(WebContext);
    const [ countdownText, setCountdownText ] = useState<string>('');
    const [ diffTime, setDiffTime ] = useState<number>(0);
    const nextUSTTimeString = dateformat(new Date(nextUSTTime), "dd/mm/yyyy hh:MM TT");

    const makeCountdownText = () => {
        const diff = (nextUSTTime - Date.now()) / 1000;
        // setDiffTime(diff);

        if (diff <= 0 && user !== null) {
            if (action === null) {
                const actionData = {
                    identity: user.identity,
                    userState: user.userState,
                };
                setAction({action: ActionType.UST, data: actionData});
            }
            
            return 'is doing UST...';
        } else {
            const days = Math.floor(diff / (24 * 60 * 60));
            if (days > 0) {
                return days + ' days';
            } else {
                const hours = Math.floor(diff / (60 * 60));
                if (hours > 0) {
                    return hours + ' hours';
                } else {
                    const minutes = Math.floor(diff / 60);
                    if (minutes > 0) {
                        return minutes + ' minutes';
                    } else {
                        return Math.floor(diff) + ' seconds';
                    }
                } 
            }
        }
    }

    useEffect(
        () => {
            makeCountdownText();
            
            const timer = setTimeout(() => {
                setCountdownText(makeCountdownText());
            }, 1000);

            return () => clearTimeout(timer);
        }
    );

    return (
        <div>
            { user !== null? 
                <div className="user-info-widget widget">
                    <div className="rep-info">
                        <p>My Reps</p>
                        <h3><img src="/images/lighting.svg"/>{user.reputation - user.spent}</h3>
                    </div>
                    <div className="ust-info">
                        <div className="block-title">In this epoch, my personas are <HelpWidget type={InfoType.persona} /></div>
                        <div className="epks">
                            {user.epoch_keys.map(key => <div className="epk" key={key}>{key}</div>)}
                        </div>
                        <div className="margin"></div>
                        <div className="block-title">Remaining time: <HelpWidget type={InfoType.countdown} /></div>
                        <div className="countdown">{countdownText}</div>
                        <div className="margin"></div>
                        <p>Transition at:</p>
                        <div className="countdown small">{nextUSTTimeString}</div>
                    </div>
                </div> : <div></div>
            }
        </div> 
    );
}


export default UserInfoWidget;