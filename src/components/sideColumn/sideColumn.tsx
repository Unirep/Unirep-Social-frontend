import { useContext } from 'react';

import './sideColumn.scss';
import { WebContext } from '../../context/WebContext';
import DefaultWidget from './defaultWidget';

const SideColumn = () => {
    const { user } = useContext(WebContext);

    return (
        <div>
            <DefaultWidget />
        </div>
    );
}

export default SideColumn;