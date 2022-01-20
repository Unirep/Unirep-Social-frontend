import { useContext, useState } from 'react';
import { UserPageContext } from '../../context/UserPageContext';
import { WebContext } from '../../context/WebContext';
import { UserPageType } from '../../constants';
import { getRecords, getEpochKeys } from '../../utils';
import { History, ActionType } from '../../constants';

type Props = {
    histories: History[],
    setHistories: (histories: History[]) => void
}

const UserHeader = ({ histories, setHistories }: Props) => {
    const { page, switchPage } = useContext(UserPageContext);
    const { user, isLoading } = useContext(WebContext);
    const pageSwitches = [UserPageType.Posts, UserPageType.History, UserPageType.Settings];
    let availablePoints = 0
    if(user?.reputation !== undefined && user?.spent !== undefined)
        availablePoints = user?.reputation - user?.spent

    const gotoSubPage = async (p: UserPageType) => {
        if (!isLoading) {
            if (p === UserPageType.History && user !== null && user !== undefined && histories.length === 0) {
                const ret = await getRecords(user.current_epoch, user.identity);
                setHistories(ret);
            }
            switchPage(p);
        }
    }

    return (
        <div className="user-page-header">
            <div className="user-info">
                <div className="user-image">
                    <img src="/images/user.png" />
                </div>
                <div className="user-reputations">
                    <h2>{availablePoints}</h2>
                    <p>My Page</p>
                </div>
            </div>
            <div className="page-switches">
                { pageSwitches.map(p => <div className={p === page? "switch chosen":"switch"} key={p} onClick={() => gotoSubPage(p)}>{p}</div>)}
            </div>
        </div>
    );
}

export default UserHeader;