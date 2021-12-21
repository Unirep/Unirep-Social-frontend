import { useState } from 'react';

import './newPage.scss';
import WritingField from '../writingField/writingField';
import SideColumn from '../sideColumn/sideColumn';
import { DataType } from '../../constants';

const NewPage = () => {
    const [epkNonce, setEpkNonce] = useState<number>(0);

    const preventPropagation = (event: any) => {
        event.stopPropagation();
    }

    const submit = () => {
        console.log('submit post');
    }

    return (
        <div className="wrapper">
            <div className="default-gesture">
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
                    <SideColumn />
                </div>
            </div>
        </div>
    );
}

export default NewPage;