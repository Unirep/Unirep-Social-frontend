import { useHistory } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';

import './signupPage.scss';
import { WebContext } from '../../context/WebContext';
import { getEpochKeys, getUserState, getAirdrop, getNextEpochTime, checkInvitationCode, userSignUp} from '../../utils';

const SignupPage = () => {
    const history = useHistory();
    const { user, setUser, setNextUSTTime } = useContext(WebContext);
    const [invitationCode, setInvitationCode] = useState<string>('');
    const [step, setStep] = useState<number>(0);
    const [identity, setIdentity] = useState<string>('');
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [userEnterIdentity, setUserEnterIdentity] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

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

    useEffect(() => {
        setErrorMsg('');
    }, [step, invitationCode, userEnterIdentity]);

    const nextStep = async () => {
        if (step === 0) {
            // send to server to check if invitation code does exist
            // if exists, get identity and commitment
            const ret = await checkInvitationCode(invitationCode);
            if (ret) {
                const {i, c, epoch} = await userSignUp();
                setIdentity(i);
                setStep(1);
            } else {
                setErrorMsg("Umm...this is not working. Try again or request a new code.");
            }
        } else if (step === 1) {
            if (isDownloaded) {
                navigator.clipboard.writeText(identity);
                setStep(2);
            }
        } else if (step === 2) {
            if (userEnterIdentity !== identity) {
                setErrorMsg('Incorrect private key. Please try again.');
            } else {
                setStep(3);
            }
        } else if (step === 3) {
            const userStateResult = await getUserState(identity);
            const currentRep = userStateResult.userState.getRepByAttester(BigInt(userStateResult.attesterId));
            const epks = getEpochKeys(identity, userStateResult.currentEpoch);
            let allEpks: string[] = [];
            for (var i = userStateResult.currentEpoch; i > 0; i --) {
                const oldEpks = getEpochKeys(identity, i);
                allEpks = [...allEpks, ...oldEpks];
            }
            const {error} = await getAirdrop(identity, userStateResult.userState);
            if(error !== undefined) {
                console.error(error)
            }

            setUser({ 
                identity: identity, 
                epoch_keys: epks, 
                all_epoch_keys: allEpks, 
                reputation: Number(currentRep.posRep) - Number(currentRep.negRep), 
                current_epoch: userStateResult.currentEpoch, 
                isConfirmed: true,
                spent: 0,
                userState: userStateResult.userState.toJSON(),
            });
            
            const nextET = await getNextEpochTime();
            setNextUSTTime(nextET);

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
                        errorMsg.length === 0? <div></div> : <div className="error">{errorMsg}</div>
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