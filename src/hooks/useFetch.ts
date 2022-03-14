import { json } from 'node:stream/consumers';
import { useState, useEffect } from 'react';

import { FetchType, ActionType } from '../constants';

const useFetch = (type: FetchType, action: ActionType, param: string|null, args: string|null, body: string|null) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    const makeURL = () => {
        if (param !== null && param.length > 0) {
            return '/api/' + action.toLowerCase() + '/' + param + '?' + args;
        } else if (args !== null && args.length > 0) {
            return '/api/' + action.toLowerCase() + '?' + args;
        } else {
            return '/api/' + action.toLowerCase();
        }
    }

    const header = {
        'content-type': 'application/json',
        // 'Access-Control-Allow-Origin': config.SERVER,
        // 'Access-Control-Allow-Credentials': 'true',
    }

    useEffect(() => {
        console.log('args changed so re-fetch: ' + args)
        setLoading(true);
        const url = makeURL();
        try {
            fetch(url, {
                headers: header,
                body,
                method: type,
            }).then(response => response.json()).then(d => {
                console.log(d);
                setData(d);
                setLoading(false);
            })
        } catch (e) {
            setError(e);
            setLoading(false);
        }    
    }, [args]);

    return { data, loading, error };
}

export default useFetch;