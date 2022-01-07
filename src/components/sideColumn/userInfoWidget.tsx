import { useContext, useEffect, useState } from 'react';
import dateformat from 'dateformat';

import { WebContext } from '../../context/WebContext';

const UserInfoWidget = () => {
    const { user, nextUSTTime } = useContext(WebContext);
    const [ countdownText, setCountdownText ] = useState<string>('');
    const nextUSTTimeString = dateformat(new Date(nextUSTTime), "dd/mm/yyyy hh:MM TT");

    const makeCountdownText = () => {
        const diff = (nextUSTTime - Date.now()) / 1000;
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
                    return diff + ' seconds';
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
                        <h3><img src="/images/lighting.svg"/>{user.reputation}</h3>
                    </div>
                    <div className="ust-info">
                        <p>In this epoch, my personas are <img src="/images/info.svg" /></p>
                        <div className="epks">
                            {user.epoch_keys.map(key => <div className="epk" key={key}>{key}</div>)}
                        </div>
                        <div className="margin"></div>
                        <p>Remaining time: <img src="/images/info.svg" /></p>
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