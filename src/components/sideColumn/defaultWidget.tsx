import { useHistory } from 'react-router-dom';
import { ABOUT_URL } from '../../config';

type Props = {
    name: string,
    gotoPage: string
}

const Choice = ( {name, gotoPage}: Props) => {
    const history = useHistory();

    return (
        <a className="default-widget-choice" href={gotoPage}>
            {name}
        </a>
    );
}

const DefaultWidget = () => {

    return (
        <div className="default-widget widget">
            <Choice name="How it works" gotoPage={ABOUT_URL} />
            <div className="choice-margin"></div>
            <Choice name="FAQ" gotoPage="/"/>
            <div className="choice-margin"></div>
            <Choice name="About" gotoPage={ABOUT_URL} />
            <div className="choice-margin"></div>
            <Choice name="Send Feedback" gotoPage="/feedback"/>
        </div>
    );
}

export default DefaultWidget;