import { useState, useContext, useEffect }  from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { WebContext } from '../../context/WebContext';
import Dropdown from '../dropdown/dropdown';
import { DataType, ChoiceType } from '../../constants';
import './writingField.scss';
import { DEFAULT_POST_KARMA, DEFAULT_COMMENT_KARMA } from '../../config';


type Props = {
    type: DataType,
    epkNonce: number,
    changeEpk: (epkNonce: number) => void,
    submit: (rep: number, content: string) => void,
    submitBtnName: string,
    onClick: (event: any) => void,
}

const WritingField = (props: Props) => {

    const defaultRep = props.type === DataType.Post? DEFAULT_POST_KARMA : DEFAULT_COMMENT_KARMA;

    const { user, setIsLoading } = useContext(WebContext);
    const [ reputation, setReputation ] = useState(defaultRep);
    const [ content, setContent ] = useState('');
    const [ errorMsg, setErrorMsg ] = useState('');
    const [ isDropdown, setIsDropdown ] = useState(false);
    const [ isBlockLoading, setIsBlockLoading ] = useState(false);
    const [percentage, setPercentage] = useState<number>(0);

    useEffect(() => {
        if (isBlockLoading) {
            const timer = setTimeout(() => {
                setPercentage(((percentage + 1) % 100) + 1);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [percentage]);

    const changeReputation = (event: any) => {
        if (event.target.value === '') {
            setReputation(defaultRep);
        } else {
            setReputation(event.target.value);
        }
        setErrorMsg('');
    }

    const onClickField = (event: any) => {
        props.onClick(event);
        setIsDropdown(false);
    }

    const handleUserInput = (event: any) => {
        setContent(event.target.value);
        setErrorMsg('');
    }

    const submit = () => {
        if (user === null) {
            setErrorMsg('Please sign up or sign in');
        } else if (isNaN(reputation)) {
            setErrorMsg('Please input reputation in number');
        } else if (user.reputation < defaultRep) {
            setErrorMsg('Sorry. You don\'t have enough reputation to perform post action.');
        } else if (reputation < defaultRep || reputation > user.reputation) {
            setErrorMsg('Please input reputation between ' + defaultRep + ' and ' + user.reputation);
        } else if (content.length === 0) {
            setErrorMsg('Please share something in order to post');
        } else {
            setIsLoading(true);
            setPercentage(1);
            setIsBlockLoading(true);
            props.submit(reputation, content);
        }
    }

    return (
        <div className="writing-field" onClick={onClickField}>
            <textarea name="userInput" placeholder="Share something!" onChange={handleUserInput}></textarea>
            <div className="setting-area">
                <div className="setting-epk">
                    <label>Select an Epoch Key to display with your post <span>?</span></label>
                    { user !== null? 
                        <Dropdown 
                            type={ChoiceType.Epk}
                            defaultChoice={user.epoch_keys[props.epkNonce]}
                            choices={user.epoch_keys}
                            onChoose={props.changeEpk}
                            isDropdown={isDropdown}
                            setIsDropdown={setIsDropdown}
                        /> : <div></div>
                    }
                </div>
                <div className="setting-reputation">
                    <label>{"Enter a reputation score " + defaultRep + " or greather (optional)"} <span>?</span></label>
                    <br/>
                    <textarea name="repInput" placeholder={"MAX " + user?.reputation} onChange={changeReputation}></textarea>
                </div>
            </div>
            {
                errorMsg.length > 0? 
                <div className="error">
                    <img src="/images/warning.png" />
                    <span>{errorMsg}</span>
                </div> : <div></div>
            }
            <div className="submit-btn" onClick={submit}>
                {props.submitBtnName}
            </div>
            <div className="note">
                {props.type === DataType.Post? 
                    "Posting will use " + defaultRep + " reputation points" : 
                    "Commenting will use " + defaultRep + " reputation points" }
            </div>
            {
                isBlockLoading? <div className="loading-block">
                    <div style={{width: 75, height: 75}}>
                        <CircularProgressbar text="Loading..." value={percentage} styles={{
                            path: {
                                transition: 'stroke-dashoffset 0.1s ease 0s',
                            }
                        }}/>
                    </div>
                </div> : <div></div>
            }
        </div>
    );
}

export default WritingField;