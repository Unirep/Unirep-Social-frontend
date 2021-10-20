import React, { useState, useContext } from 'react';
import { WebContext } from '../../context/WebContext';
import * as Constants from '../../constants';
import { FaTwitter } from 'react-icons/fa';
import { checkInvitationCode, userSignUp, getEpochKeys, getNextEpochTime, getAirdrop } from '../../utils';
import './overlay.scss';

const SignUp = () => {
    const { user, setUser, setPageStatus, setNextUSTTime } = useContext(WebContext);
    
    
    // step 0: sign up with twitter / others
    // step 1: private key randomly generated
    // step 2: confirm private key
    const [step, setStep] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [codeInput, setCodeInput] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [identity, setIdentity] = useState("");
    const [commitment, setCommitment] = useState("");
    const [currentEpoch, setCurrentEpoch] = useState(0);
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);

    const preventCloseBox = (event: any) => {
        event.stopPropagation();
    }

    const nextStep = async (event: any) => {
        event.stopPropagation();
        setErrorMsg("");

        if (step === 0) {
            const {i, c, epoch} = await userSignUp();
            setIdentity(i);
            setCommitment(c);
            setCurrentEpoch(epoch);
        }

        setStep((prevState) => (prevState + 1));
    }

    const previousStep = (event: any) => {
        event.stopPropagation();
        setStep((prevState) => (prevState > 0? prevState - 1 : 0));
        // console.log('sign up step: ' + step);
    }

    const copyPrivateKey = (event: any) => {
        event.stopPropagation();
        navigator.clipboard.writeText(identity);
        setIsCopied(true);
    }

    const downloadPrivateKey = (event: any) => {
        event.stopPropagation();

        const element = document.createElement('a');
        const file = new Blob([identity], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = 'unirep-social-identity.txt';
        document.body.appendChild(element);
        element.click();

        setIsDownloaded(true);
    }

    const handleInvitationCode = (event: any) => {
        event.stopPropagation();
        setCodeInput(event.target.value);
    }

    const submitInvitationCode = async (event: any) => {
        const ret = await checkInvitationCode(codeInput);
        if (ret) {
            await nextStep(event);
        } else {
            setErrorMsg("Wrong invitation code.");
        }
    }

    const handleUserInput = (event: any) => {
        event.stopPropagation();
        setUserInput(event.target.value);
        if (event.target.value !== identity) {
            setErrorMsg("Incorrect private key. Go back to download your key.");
        } else {
            setErrorMsg("");
        }
    }

    const closeBox = async () => {
        // get userstate related functions will check if user has signed up, if no, save in local storage, every refresh of page will check it again. //
        const ret = await getEpochKeys(identity);
        const currentRep = ret.userState.getRepByAttester(ret.attesterId);
        await getAirdrop(identity);

        setPageStatus(Constants.PageStatus.None);
        setUser({ 
            identity: identity, 
            epoch_keys: ret.epks, 
            reputation: Number(currentRep.posRep) - Number(currentRep.negRep), 
            current_epoch: currentEpoch, 
            isConfirmed: ret.hasSignedUp 
        });

        const nextET = await getNextEpochTime();
        setNextUSTTime(nextET);
    }

    return (
        <div className="signBox" onClick={preventCloseBox}>
            <div className="sign-title">
                <h3>{
                    step === 0?
                    "Join the Unirep Community" : step === 1?
                    "Protect Your Private Key" : step === 2?
                    "Confirm Your Private Key" : "Sign Up Error"
                }</h3> 
            </div>
            {
                step === 0?
                <div className="signup-with">
                    <div className="sign-message">
                        UnirRep is an invite only social community. Enter your 8 character invitation code below.
                    </div>
                    <input name="invitationCode" placeholder="Invite code" onChange={handleInvitationCode} />
                    <div className="sign-button-purple" onClick={submitInvitationCode}>Sign Up</div>
                    {errorMsg !== ''? 
                        <div className="sign-error-message">
                            {errorMsg}
                        </div> : <div></div>
                    }
                </div> : step === 1?
                <div>
                    <div className="sign-message">
                        Record this private key and store it safely. You will need it to regain access to your reputation score.
                    </div>
                    <div className="sign-private-key" onClick={copyPrivateKey}>
                        {identity}
                        <div className="divider"></div>
                        <div className={isCopied? "copy copied":"copy"} onClick={copyPrivateKey}>
                            <img src={isCopied? "/images/check.png":"/images/copy.png"} />
                            <span>{isCopied? "Copied" : "Copy to Clipboard"}</span>
                        </div>
                    </div>
                    <div className="divider-or">- or -</div>
                    <div className="sign-buttons">
                        {isDownloaded? 
                            <div className="sign-button-grey" onClick={downloadPrivateKey}>Private Key Downloaded</div> :
                            <div className="sign-button-purple" onClick={downloadPrivateKey}>Download Private Key</div>
                        }
                        <div className={isDownloaded? "sign-button-purple":"sign-button-white"} onClick={nextStep}>Next</div>
                    </div>
                </div> : step === 2?
                <div>
                    <div className="sign-message">
                        Record this private key and store it safely. You will need it to regain access to your reputation score.
                    </div>
                    <div className="sign-private-key">
                        <textarea name="userInput" placeholder="enter your private key" onChange={handleUserInput} />
                    </div>
                    {errorMsg !== ''? 
                        <div className="sign-error-message">
                            <img src="/images/warning.png" />
                            <span>{errorMsg}</span>
                        </div> : <div></div>
                    }
                    <div className="margin-box"></div>
                    <div className="sign-button-purple" onClick={closeBox}>Confirm</div>
                    <div className="sign-button-white" onClick={previousStep}>Back</div>
                </div> : <div>{errorMsg}</div>
            } 
        </div>
    );
}

export default SignUp;