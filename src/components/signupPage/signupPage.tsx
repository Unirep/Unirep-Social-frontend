import { useHistory } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';

import './signupPage.scss';
import { WebContext } from '../../context/WebContext';
import { getEpochKeys, getUserState, getAirdrop, getNextEpochTime, checkInvitationCode, userSignUp} from '../../utils';
import LoadingCover from '../loadingCover/loadingCover';
import LoadingButton from '../loadingButton/loadingButton';

const SignupPage = () => {
    const history = useHistory();
    const { user, setUser, setNextUSTTime, isLoading, setIsLoading } = useContext(WebContext);
    const [invitationCode, setInvitationCode] = useState<string>('');
    const [step, setStep] = useState<number>(0);
    const [identity, setIdentity] = useState<string>('');
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [userEnterIdentity, setUserEnterIdentity] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [isButtonLoading, setButtonLoading] = useState<boolean>(false);

    const title = [
        "Join us",
        "Great to have you here!",
        "Let's confirm the ownership.",
        `🎉  NICE. <br>30 Rep + 3 personas awaits you!`
    ];

    const content = [
        "Currently, UniRep Social is an invite only community. Please enter your invitation code below.",
        "UniRep Social’s anonymous reputation system uses a technology called Semaphore. It generates a secure private key that you use instead of a username and password to show that you’re a registered UniRep user. Yes, we know it’s not exactly easy to memorize - that’s why it’s very important for you to store it safely. <br> This key is how you access your UniRep account and Rep. We can not recover it for you if it’s lost. ",
        "Please paste your private key below.",
        "Now that you have confirmed ownership of your private key, it’s time to generate your weekly personas. In every cycle, members of the community  receive 3 different random strings to use as personas and 30 Rep. which are used for interactions. Let’s be kind to one another and start having fun!"
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
            setButtonLoading(true);
            const ret = await checkInvitationCode(invitationCode);
            if (ret) {
                const {i, c, epoch} = await userSignUp();
                setIdentity(i);
                setStep(1);
            } else {
                setErrorMsg("Umm...this is not working. Try again or request a new code.");
            }
            setButtonLoading(false);
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
            setIsLoading(true);

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

            setIsLoading(false);
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
                    step === 0? <img src="/images/close.svg" onClick={() => history.push('/')}/> : <div></div>
                }
                <div className="info">
                    <div className="title">{title[step].split('<br>').map(t => <span>{t}<br/></span>)}</div>
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
                            </div> : <div className="main-btn" onClick={nextStep}>
                                <LoadingButton isLoading={isButtonLoading} name={mainButton[step]}/>
                            </div>
                    }
                    <div className="added-info">Need an invitation code? <a href="https://about.unirep.social/alpha-invitation" target="_blank">Request here</a></div>
                </div>
            </div>
            { isLoading? <LoadingCover /> : <div></div> }
        </div>
    );
}

export default SignupPage;