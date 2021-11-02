import React, { useContext, useState } from 'react';
import { helpData } from './helpPageData';
import './helpPage.scss';
import HelpList from './helpList';
import LearnZone from './learnZone';
import ReportZone from './reportZone';

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
                <LearnZone />
            </div>
            <ReportZone />
        </div>
    );
};

export default HelpPage;