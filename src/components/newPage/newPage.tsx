import { useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import './newPage.scss';
import { WebContext } from '../../context/WebContext';
import WritingField from '../writingField/writingField';
import SideColumn from '../sideColumn/sideColumn';
import { DataType, Page, ActionType } from '../../constants';

const NewPage = () => {
    const history = useHistory();
    const location = useLocation<Location>();
    const state = JSON.parse(JSON.stringify(location.state));
    const isConfirmed = state.isConfirmed;

    const { setAction, user } = useContext(WebContext);

    useEffect(() => {
        console.log('Is this new page being confirmd? ' + isConfirmed);
    }, [])

    const preventPropagation = (event: any) => {
        event.stopPropagation();
    }

    const submit = (title: string, content: string, epkNonce: number, reputation: number) => {
        console.log('submit post');
        if (user === null) {
            console.log('not login yet.');
        } else {
            const actionData = {
                title,
                content, 
                epkNonce,
                identity: user.identity, 
                reputation, 
                spent: user.spent
            };
            setAction({action: ActionType.Post, data: actionData})
        }
        history.push('/');
    }

    return (
        <div className="body-columns">
            <div className="margin-box"></div>
            <div className="content">
                <div className="main-content">
                    <h3>Create post</h3>
                    <WritingField
                        type={DataType.Post}
                        submit={submit}
                        submitBtnName="Post - 5 points"
                        onClick={preventPropagation}
                    />
                </div>
                <div className="side-content">
                    <SideColumn page={Page.New} />
                </div>
            </div>
            <div className="margin-box"></div>
        </div>
    );
}

export default NewPage;