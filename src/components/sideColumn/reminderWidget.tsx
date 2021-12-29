import { Page } from '../../constants';

type Props = { // to be used in the future
    page: Page,
}

const ReminderWidget = () => {

    return (
        <div className="reminder-widget widget">
            <h3>Reminder for you</h3>
            <div className="divider"></div>
            <p>Create post will use 5 Rep.</p>
            <div className="divider"></div>
            <p>Our current topic: Ethereum.</p>
            <div className="divider"></div>
            <p>Be respectful.</p>
            <div className="divider"></div>
            <p>Please keep all posts in English.</p>
        </div>
    );
}

export default ReminderWidget;