import { useHistory } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';

import './loginPage.scss';
import { WebContext } from '../../context/WebContext'; 
import { getEpochKeys, hasSignedUp, getUserState, userStateTransition, getAirdrop, getNextEpochTime, getEpochSpent } from '../../utils';
import LoadingCover from '../loadingCover/loadingCover';

const LoginPage = () => {
    const history = useHistory();
    const { user, setUser, setNextUSTTime, isLoading, setIsLoading } = useContext(WebContext);
    const [input, setInput] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    useEffect(() => {
        setErrorMsg('')
    }, [input]);

    const handleInput = (event: any) => {
        setInput(event.target.value);
    }

    const login = async () => {
        const userSignUpResult = await hasSignedUp(input);
        
        if(userSignUpResult.hasSignedUp === false) {
            setErrorMsg('Incorrect private key. Please try again.')
        } else if (userSignUpResult.hasSignedUp) {
            setIsLoading(true);

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

            setIsLoading(false);
            history.push('/');
        }
    }

    return (
        <div className="login-page">
            <div className="left-column">
                <img src="/images/unirep-title-white.svg" />
            </div>
            <div className="right-column">
                <img src="/images/close.svg" onClick={() => history.push('/')}/>
                <div className="info">
                    <div className="title">Welcome back</div>
                    <p>Please paster your private key below.</p>
                    <textarea placeholder="enter your private key here." onChange={handleInput} />
                    {
                        errorMsg.length === 0? <div></div> : <div className="error">{errorMsg}</div>
                    }
                    <div className="sign-in-btn" onClick={login}>Sign in</div>
                    <div className="notification">Lost your private key? Hummm... we can't help you to recover it, that's a lesson learned for you. Want to restart to earn rep points? <a target="_blank" href="https://about.unirep.social/alpha-invitation">Request an invitation code here.</a></div>
                    <div className="go-to-signup">Got an invitation code? <a href="/signup">Join here</a></div>
                </div>
            </div>
            { isLoading? <LoadingCover /> : <div></div>}
        </div>
    );
}

export default LoginPage;