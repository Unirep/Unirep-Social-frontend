import { useState, useContext, useEffect }  from 'react';
import { useHistory } from 'react-router-dom';
import 'react-circular-progressbar/dist/styles.css';
import { WebContext } from '../../context/WebContext';
import HelpWidget from '../helpWidget/helpWidget';
import { DataType, InfoType } from '../../constants';
import './writingField.scss';
import * as config from '../../config';


type Props = {
    type: DataType,
    submit: (title: string, content: string, epkNonce: number, reputation: number) => void,
    submitBtnName: string,
    onClick: (event: any) => void,
}

const WritingField = (props: Props) => {

    const defaultRep = props.type === DataType.Post? config.DEFAULT_POST_KARMA : config.DEFAULT_COMMENT_KARMA;
    const history = useHistory();

    const { user, setIsLoading } = useContext(WebContext);
    const [ reputation, setReputation ] = useState(defaultRep);
    const [ title, setTitle ] = useState<string>('');
    const [ content, setContent ] = useState<string>('');
    const [ epkNonce, setEpkNonce ] = useState<number>(0);
    const [ errorMsg, setErrorMsg ] = useState<string>('');
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

    const handleTitleInput = (event: any) => {
        setTitle(event.target.value);
    }

    const handleContentInput = (event: any) => {
        setContent(event.target.value);
        setErrorMsg('');
    }

    const handleRepInput = (event: any) => {
        setReputation(event.target.value);
    }

    const submit = () => {
        if (user === null) {
            setErrorMsg('Please sign up or sign in');
        } else {
            setIsLoading(true);
            setPercentage(1);
            setIsBlockLoading(true);
            props.submit(title, content, epkNonce, reputation);
        }
    }

    return (
        <div className="writing-field" onClick={onClickField}>
            {
                props.type === DataType.Post? <input type="text" placeholder="Give an eye-catching title" onChange={handleTitleInput}/> : <div></div>
            }
            { 
                props.type === DataType.Post? <textarea onChange={handleContentInput} /> : <textarea autoFocus onChange={handleContentInput} />
            }
            <div className="info-row">
                <div className="element">
                    <div className="name">Post as <HelpWidget type={InfoType.epk4Post} /></div>
                    <div className="epks">
                        { user === null? 
                            <div>somethings wrong...</div> : 
                            user.epoch_keys.map((epk, i) => 
                                <div className={i === epkNonce? "epk chosen" : "epk"} onClick={() => setEpkNonce(i)} key={i}>
                                    {epk}
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="element">
                    <div className="name">My Rep show off <HelpWidget type={InfoType.rep} /></div>
                    <div className="rep-chooser">
                        <input type="range" 
                            min={defaultRep} 
                            max={user? user.reputation : defaultRep} 
                            onChange={handleRepInput}
                            value={reputation}
                        />
                        <input type="text" value={reputation} onChange={handleRepInput}/>
                    </div>
                </div>
            </div>
            <div className="submit-btn" onClick={submit}>{props.submitBtnName}</div>
        </div>
    );
}

export default WritingField;