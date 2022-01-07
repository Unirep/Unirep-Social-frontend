import { useHistory } from 'react-router-dom';
import { useContext, useState } from 'react';

import './signupPage.scss';
import { WebContext } from '../../context/WebContext';
import { getEpochKeys } from '../../utils';

const SignupPage = () => {
    const history = useHistory();
    const { user, setUser } = useContext(WebContext);
    const [invitationCode, setInvitationCode] = useState<string>('');
    const [step, setStep] = useState<number>(0);
    const [identity, setIdentity] = useState<string>('Unirep.identity.WyJlOGQ2NGU5OThhM2VmNjAxZThjZTNkNDQwOWQyZjc3MjEwOGJkMGI1NTgwODAzYjY2MDk0YTllZWExMzYxZjA2IiwiODZiYjk5ZGQ4MzA2ZGVkZDgxYTE4MzBiNmVjYmRlZjk5ZmVjYTU3M2RiNjIxMjk5NGMyMmJlMWEwMWZmMTEiLCIzMGE3M2MxMjE4ODQwNjE0MWQwYmI4NWRjZDY5ZjdhMjEzMWM1NWRkNDQzYWNmMGVhZTEwNjI2NzBjNDhmYSJd278');
    // const [commitment, setCommitment] = useState<string>('');
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [userEnterIdentity, setUserEnterIdentity] = useState<string>('');

    const title = [
        "Join us",
        "Great to have you here!",
        "Let's confirm the ownership.",
        "🎉  NICE. "
    ];

    const content = [
        "UniRep Social currently is an invite only community. Please enter your invitation code below.",
        "UniRep Social uses Semaphore technology to generate the private key. Yea we know it's not user-friendly codes, that's why it's very important for you to store it safely. This key will be used to regain access to your rep points.",
        "Please paste your private key below.",
        "Ownership is confirmed, we want to celebrate this by giving you 30 Rep. Everyday, members in the community will receive 3 different epoch keys as persona & 30 Reps to interact within the community. So be kind, be nice & let's make our community sweet."
    ];

    const mainButton = [
        "Let me in",
        "",
        "Submit",
        "Generate"
    ];

    const nextStep = async () => {
        if (step === 0) {
            // send to server to check if invitation code does exist
            // if exists, get identity and commitment
            setStep(1);
        } else if (step === 1) {
            if (isDownloaded) {
                navigator.clipboard.writeText(identity);
                setStep(2);
            }
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            const epks = await getEpochKeys(identity, 1);
            setUser({
                identity, 
                epoch_keys: epks, 
                all_epoch_keys: epks,
                reputation: 30,
                current_epoch: 1,
                isConfirmed: true,
                spent: 0,
                userState: {}
            });
            history.push('/');
        }
    }

    const handleInput = (event: any) => {
        if (step === 0) {
            setInvitationCode(event.target.value);
        } else if (step === 2) {
            setUserEnterIdentity(event.target.value);
        }
    }

    const downloadPrivateKey = () => {
        const element = document.createElement('a');
        const file = new Blob([identity], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = 'unirep-social-identity.txt';
        document.body.appendChild(element);
        element.click();

        setIsDownloaded(true);
    }

    return (
        <div className="signup-page">
            <div className="left-column">
                <img src="/images/unirep-title-white.svg" />
            </div>
            <div className="right-column">
                {
                    step === 0? <img src="/images/close.svg" onClick={() => history.goBack()}/> : <div></div>
                }
                <div className="info">
                    <div className="title">{title[step]}</div>
                    <p>{content[step]}</p>
                    {
                        step === 3? 
                            <div></div> : 
                            <textarea 
                                className={step === 0? '' : 'larger'} 
                                onChange={handleInput} 
                                value={step === 0? invitationCode : step === 1? identity : step === 2? userEnterIdentity : ''} 
                            />
                    }
                    {
                        step === 1?
                            <div className="row-with-step">
                                <div className="buttons">
                                    <div className={isDownloaded? "half-btn disabled" : "half-btn"} onClick={downloadPrivateKey}>Download</div>
                                    <div className="margin"></div>
                                    <div className={isDownloaded? "half-btn" : "half-btn disabled"} onClick={nextStep}>Copy</div>
                                </div>
                                <div className="step">
                                    <div className={isDownloaded? "number disabled" : "number"}>1</div>
                                    <div className={isDownloaded? "line" : "line disabled"}></div>
                                    <div className={isDownloaded? "number" : "number disabled"}>2</div>
                                </div>
                            </div> : <div className="main-btn" onClick={nextStep}>{mainButton[step]}</div>
                    }
                    <div className="added-info">Need an invitation code? <span>Request here</span></div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;