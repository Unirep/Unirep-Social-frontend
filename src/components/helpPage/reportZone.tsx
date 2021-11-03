import { useState } from 'react';

const ReportZone = () => {
    const [issue, setIssue] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [errMsg, setErrMsg] = useState<string>('');

    const stopPropagation = (event: any) => {
        event.stopPropagation();
    }

    const onIssueChange = (event: any) => {
        setErrMsg('');
        setIssue(event.target.value);
    }

    const onEmailChange = (event: any) => {
        setEmail(event.target.value);
    }

    const submit = (event: any) => {
        stopPropagation(event);
        if (issue === '') {
            setErrMsg('You have not input your issue yet.');
        } else {
            console.log(`Send report to server: ${issue} with email ${email}.`);
        }
    }

    return (
        <div className="report-zone">
            <h3>Report An Issue</h3>
            <p>Share your issue below and include your email for a direct response.</p>
            <textarea placeholder="Describe issue" name="issue" onChange={onIssueChange} onClick={stopPropagation} />
            <textarea placeholder="Your email (optional)" name="email" rows={1} onChange={onEmailChange} onClick={stopPropagation} />
            {
                errMsg.length > 0? 
                <div className="error">
                    <img src="/images/warning.png" />
                    <span>{errMsg}</span>
                </div> : <div></div>
            }
            <div className="submit-btn" onClick={submit}>Submit</div>
        </div>
    )
}

export default ReportZone;