import { useHistory } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';

import './loginPage.scss';
import { WebContext } from '../../context/WebContext'; 
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppContext'; 

import { getEpochKeys, hasSignedUp, getUserState, userStateTransition, getAirdrop, getNextEpochTime, getEpochSpent } from '../../utils';
import LoadingCover from '../loadingCover/loadingCover';
import LoadingButton from '../loadingButton/loadingButton';

const LoginPage = () => {
    const history = useHistory();
    const { setNextUSTTime } = useContext(WebContext);
    const { user, setUser } = useAuth();
    const { isPending, setIsPending } = useAppState();

    const [input, setInput] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [isButtonLoading, setButtonLoading] = useState<boolean>(false);

    useEffect(() => {
        setErrorMsg('')
    }, [input]);

    const handleInput = (event: any) => {
        setInput(event.target.value);
    }

    const login = async () => {
        setButtonLoading(true);
        const userSignUpResult = await hasSignedUp(input);
        setButtonLoading(false);
        
        if(userSignUpResult.hasSignedUp === false) {
            setErrorMsg('Incorrect private key. Please try again.')
        } else if (userSignUpResult.hasSignedUp) {
            setIsPending(true);

            const userStateResult = await getUserState(input, user?.userState);
            const userEpoch = userStateResult.userState.latestTransitionedEpoch;
            let userState: any = userStateResult.userState;

            if (userEpoch !== userStateResult.currentEpoch) {
                console.log('user epoch is not the same as current epoch, do user state transition, ' + userEpoch + ' != ' + userStateResult.currentEpoch);
                const retBeforeUST = await userStateTransition(input, userState.toJSON());
                const retAfterUST = await getUserState(input, retBeforeUST.userState.toJSON(), true)

                userState = retAfterUST.userState;
            } 
            try {
                console.log('get airdrop')
                await getAirdrop(input, userState.toJSON());
                const next = await getNextEpochTime();
                setNextUSTTime(next);
            } catch (e) {
                console.log('airdrop error: ', e)
            }
            
            const reputation = userState.getRepByAttester(userStateResult.attesterId);
            console.log('has signed up flag', reputation.signUp)
            
            const epks = getEpochKeys(input, userStateResult.currentEpoch);
            const spent = await getEpochSpent(epks);

            let allEpks: string[] = [];
            for (var i = userStateResult.currentEpoch; i > 0; i --) {
                const oldEpks = getEpochKeys(input, i);
                allEpks = [...allEpks, ...oldEpks];
            }
            setUser({
                identity: input,
                epoch_keys: epks,
                all_epoch_keys: allEpks,
                reputation: Number(reputation.posRep) - Number(reputation.negRep),
                current_epoch: userStateResult.currentEpoch,
                isConfirmed: true,
                spent: spent,
                userState: userState.toJSON(),
            });

            const nextET = await getNextEpochTime();
            setNextUSTTime(nextET);

            setIsPending(false);
            history.push('/');
        }
    }

    return (
        <div className="login-page">
            <div className="left-column">
                <img src="/images/unirep-title-white.svg" />
            </div>
            <div className="right-column">
                <div className="close">
                    <img id="unirep-icon" src="/images/unirep-title.svg" />
                    <img id="close-icon" src="/images/close.svg" onClick={() => history.push('/')}/>
                </div>
                <div className="info">
                    <div className="title">Welcome back</div>
                    <p>To enter the app, please use the private key you got when you signed up.</p>
                    <textarea placeholder="enter your private key here." onChange={handleInput} />
                    {
                        errorMsg.length === 0? <div></div> : <div className="error">{errorMsg}</div>
                    }
                    <div className="sign-in-btn" onClick={login}>
                        <LoadingButton isLoading={isButtonLoading} name="Sign in"/>
                    </div>
                    <div className="notification">Lost your private key? Hummm... we can't help you to recover it, that's a lesson learned for you. Want to restart to earn rep points? <a target="_blank" href="https://about.unirep.social/alpha-invitation">Request an invitation code here.</a></div>
                    <div className="go-to-signup">Got an invitation code? <a href="/signup">Join here</a></div>
                </div>
            </div>
            { isPending? <LoadingCover /> : <div></div>}
        </div>
    );
}

export default LoginPage;