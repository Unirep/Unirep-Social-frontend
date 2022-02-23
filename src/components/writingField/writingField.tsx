import { useState, useContext, useEffect }  from 'react';
import { useHistory } from 'react-router-dom';
import 'react-circular-progressbar/dist/styles.css';
import { WebContext } from '../../context/WebContext';
import HelpWidget from '../helpWidget/helpWidget';
import { DataType, InfoType, Draft } from '../../constants';
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

    const { user, setIsLoading, draft, setDraft } = useContext(WebContext);
    const [ reputation, setReputation ] = useState(defaultRep);
    const [ title, setTitle ] = useState<string>('');
    const [ content, setContent ] = useState<string>('');
    const [ epkNonce, setEpkNonce ] = useState<number>(0);
    const [ errorMsg, setErrorMsg ] = useState<string>('');

    useEffect(() => {
        if (draft !== null && draft.type === props.type) {
            setTitle(draft.title);
            setContent(draft.content);
        }
    }, []);

    useEffect(() => {
        setErrorMsg('');
    }, [title, content, reputation, epkNonce]);

    const onClickField = (event: any) => {
        props.onClick(event);
    }

    const handleTitleInput = (event: any) => {
        setTitle(event.target.value);

        if (draft === null) {
            const d: Draft = {type: props.type, title: event.target.value, content};
            setDraft(d);
        } else {
            if (draft.type === props.type) {
                setDraft({...draft, title: event.target.value});
            } else {
                setDraft({...draft, title: event.target.value, type: props.type});
            }
        }
    }

    const handleContentInput = (event: any) => {
        setContent(event.target.value);
        
        if (draft === null) {
            const d: Draft = {type: props.type, title, content: event.target.value};
            setDraft(d);
        } else {
            if (draft.type === props.type) {
                setDraft({...draft, content: event.target.value});
            } else {
                setDraft({...draft, content: event.target.value, type: props.type});
            }  
        }
    }

    const handleRepInput = (event: any) => {
        setReputation(event.target.value);
    }

    const submit = () => {
        if (user === null) {
            setErrorMsg('Please sign up or sign in');
        } else {
            if (title.length === 0 && content.length === 0) {
                setErrorMsg('Please input either title or content.');
            } else {
                props.submit(title, content, epkNonce, reputation);
            }
        }
    }

    return (
        <div className="writing-field" onClick={onClickField}>
            {
                props.type === DataType.Post? <input type="text" placeholder="Give an eye-catching title" onChange={handleTitleInput} value={title} /> : <div></div>
            }
            { 
                props.type === DataType.Post? <textarea onChange={handleContentInput} value={content} /> : <textarea autoFocus onChange={handleContentInput} value={content} />
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
                    <div className="name">My Rep display <HelpWidget type={InfoType.rep} /></div>
                    <div className="rep-chooser">
                        <input type="range" 
                            min={defaultRep} 
                            max={user? user.reputation - user.spent : defaultRep} 
                            onChange={handleRepInput}
                            value={reputation}
                        />
                        <input type="text" value={reputation} onChange={handleRepInput}/>
                    </div>
                </div>
            </div>
            <div className="submit-btn" onClick={submit}>{props.submitBtnName}</div>
            { errorMsg.length > 0? <div className="error">{errorMsg}</div>: <div></div>}
        </div>
    );
}

export default WritingField;