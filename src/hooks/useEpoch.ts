import { useState, useEffect } from 'react';

import { getNextEpochTime, getCurrentEpoch } from '../utils';

const useEpoch = () => {
    const [nextEpochAt, setNextEpochAt] = useState<number>(4789220745000);
    const [currentEpoch, setCurrentEpoch] = useState<number>(-1);
    const [needReload, setNeedReload] = useState<boolean>(true);

    useEffect(() => {
        const getEpochInfo = async () => {
            try {
                const ret1 = await getNextEpochTime();
                setNextEpochAt(ret1);

                const ret2 = await getCurrentEpoch();
                setCurrentEpoch(ret2);
            } catch (e) {
                throw(e);
            }
        }

        if (needReload) {
            getEpochInfo();
            setNeedReload(false);
        }
    }, [needReload]);

    return {nextEpochAt, currentEpoch, setNeedReload: () => setNeedReload(true)};
}

export default useEpoch;