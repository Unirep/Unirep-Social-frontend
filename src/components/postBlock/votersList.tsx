import { Vote } from '../../constants';
import Jdenticon from 'react-jdenticon';

type Props = {
    votes: Vote[],
}
const VotersList = (props: Props) => {

    const preventClose = (event: any) => {
        event.stopPropagation();
    }

    return (
        <div className="voters-list" onClick={preventClose}>
            {
                props.votes.map((v, index) => (
                    <div className="voter" key={v.epoch_key + index}>
                        <div className="epk-icon"><Jdenticon size="12" value={v.epoch_key} /></div>
                        <span>{v.epoch_key}</span>
                        {
                            v.upvote > 0? <img src="/images/upvote-purple.png"/> : <img src="/images/downvote.png"/>
                        }
                        {
                            v.upvote > 0? <span>{v.upvote}</span>:<span>{v.downvote}</span>
                        }
                    </div>
                ))
            }
        </div>
    );
}

export default VotersList;