import { useHistory } from 'react-router-dom';
import { useContext, useState } from 'react';

import './loginPage.scss';
import { WebContext } from '../../context/WebContext'; 
import { getEpochKeys } from '../../utils';


const LoginPage = () => {
    const history = useHistory();
    const { user, setUser } = useContext(WebContext);
    const [input, setInput] = useState<string>('');

    const handleInput = (event: any) => {
        setInput(event.target.value);
    }

    const login = async () => {
        const epks = await getEpochKeys(input, 1);
        setUser({
            identity: input, 
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

    return (
        <div className="login-page">
            <div className="left-column">
                <img src="/images/unirep-title-white.png" />
            </div>
            <div className="right-column">
                <img src="/images/close.png" onClick={() => history.goBack()}/>
                <div className="info">
                    <div className="title">Welcome back</div>
                    <p>Please paster your private key below.</p>
                    <textarea placeholder="enter your private key here." onChange={handleInput} />
                    <div className="sign-in-btn" onClick={login}>Sign in</div>
                    <div className="notification">Lost your private key? Hummm... we can't help you to recover it, that's a lesson learned for you. Want to restart to earn rep points? <span>Request an invitation code here.</span></div>
                    <div className="go-to-signup">Got an invitation code? <span>Join here</span></div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;