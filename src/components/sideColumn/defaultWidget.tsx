import { useHistory } from 'react-router-dom';

type Props = {
    name: string,
    gotoPage: string
}

const Choice = ( {name, gotoPage}: Props) => {
    const history = useHistory();

    return (
        <div className="default-widget-choice" onClick={() => history.push(gotoPage)}>
            {name}
        </div>
    );
}

const DefaultWidget = () => {

    return (
        <div className="default-widget widget">
            <Choice name="How it works" gotoPage="/"/>
            <div className="choice-margin"></div>
            <Choice name="FAQ" gotoPage="/"/>
            <div className="choice-margin"></div>
            <Choice name="About" gotoPage="/"/>
            <div className="choice-margin"></div>
            <Choice name="Send Feedback" gotoPage="/"/>
        </div>
    );
}

export default DefaultWidget;