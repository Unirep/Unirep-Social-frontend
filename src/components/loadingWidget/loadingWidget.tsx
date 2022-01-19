import { useState, useContext, useEffect } from 'react';

import './loadingWidget.scss';
import { WebContext } from '../../context/WebContext';

enum LoadingState {
    loading,
    succeed,
    fail,
    none,
}

const LoadingWidget = () => {
    const { isLoading, setIsLoading } = useContext(WebContext);
    const [ loadingState, setLoadingState ] = useState<LoadingState>(LoadingState.none);
    const [ isFlip, setFlip ] = useState<boolean>(false);
    
    useEffect(() => {
        console.log('isLoading: ' + isLoading);
    }, [isLoading]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFlip(!isFlip);
        }, 500);

        return () => clearTimeout(timer);
    }, [isFlip]);

    return (
        <div className="loading-widget">
            {
                !isLoading? <div></div> : 
                    <div className="loading-block">
                        <img src="/images/loader.svg" style={{ transform: `scaleX(${isFlip? '-1': '1'})` }} />
                        <span>{loadingState === LoadingState.loading? "Submitting your content..." : "succeed or fail"}</span>
                    </div>
            }
        </div>
    );
}

export default LoadingWidget;