import { useState } from 'react';
import './helpWidget.scss';
import { InfoType } from '../../constants';

type Props = {
    type: InfoType
}

const HelpWidget = ({ type }: Props) => {
    const [ isHover, setHover ] = useState<boolean>(false);

    return (
        <div className="help-widget">
            <img src="/images/info.svg" onMouseEnter={() => setHover(true)} onMouseOut={() => setHover(false)} />
            {
                isHover? 
                    <div className="info">{type}</div> : <div></div>
            }
        </div>
    );
}

export default HelpWidget;