import { useContext } from 'react';

import './sideColumn.scss';
import { WebContext } from '../../context/WebContext';
import DefaultWidget from './defaultWidget';

const SideColumn = () => {
    const { user } = useContext(WebContext);

    return (
        <div>
            <DefaultWidget />
            <div className="back-to-top" onClick={() => window.scrollTo(0, 0)}>Back to top</div>
        </div>
    );
}

export default SideColumn;