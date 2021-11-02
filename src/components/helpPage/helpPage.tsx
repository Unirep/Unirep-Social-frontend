import React, { useContext, useState } from 'react';
import { helpData } from './help';
import './helpPage.scss';
import HelpList from './helpList';

const HelpPage = () => {

    const [searchInput, setSearchInput] = useState<string>('');

    const handleSearchInput = (event: any) => {
        setSearchInput(event.target.value);
    }  

    const closeAll = () => {
        console.log('choosible to do');
    }

    return (
        <div className="default-gesture" onClick={closeAll}>
            <div className="main-content">
                <div className="search-bar">
                    <img src="/images/search.png" />
                    <input type="text" name="searchInput" placeholder="Search by keyword" onChange={handleSearchInput} />
                </div>
                <HelpList data={helpData} level={1} key={1} />
                <div className="learn-zone"></div>
            </div>
            <div className="report-zone"></div>
        </div>
    );
};

export default HelpPage;