import { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import './newPage.scss';
import { WebContext } from '../../context/WebContext';
import WritingField from '../writingField/writingField';
import SideColumn from '../sideColumn/sideColumn';
import { DataType, Page, ActionType } from '../../constants';

const NewPage = () => {
    const history = useHistory();
    const { setIsLoading, setAction, user } = useContext(WebContext);

    const [epkNonce, setEpkNonce] = useState<number>(0);

    const preventPropagation = (event: any) => {
        event.stopPropagation();
    }

    const submit = (title: string, content: string, epkNonce: number, reputation: number) => {
        console.log('submit post');
        if (user === null) {
            console.log('not login yet.');
        } else if (content.length === 0) {
            console.error('not enter anything yet.');
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
        <div className="wrapper">
            <div className="default-gesture">
                <div className="margin-box"></div>
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
                <div className="margin-box"></div>
            </div>
        </div>
    );
}

export default NewPage;