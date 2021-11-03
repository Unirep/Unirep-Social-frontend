import { learnData } from './helpPageData';

type Props = {
    data: any
}

const LearnBlock = ({ data }: Props) => {
    return (
        <div className='learn-block'>
            <div className="learn-block-inner">
                <div className='learn-title'>{data.title}</div>
                <div className='learn-content'>{data.content}</div>
                <img src={`/images/${data.image}`} />
            </div>
        </div>
    );
}

const LearnZone = () => {
    return (
        <div className="learn-zone">
            <h3>Learn</h3>
            {
                learnData.map((d, i) => <LearnBlock data={d} key={i}/>)
            }
        </div>
    );
}

export default LearnZone;