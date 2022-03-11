import { createContext, useContext } from 'react';

import useEpoch from '../hooks/useEpoch';

type EpochContent = {
    nextEpochAt: number
    currentEpoch: number
    setNeedReload: () => void
}

const EpochContext = createContext<EpochContent>({
    nextEpochAt: 4789220745000, // default 100 years later
    currentEpoch: -1,
    setNeedReload: () => {}
});

type Props = {
    children: any
}

export const EpochProvider = ({ children }: Props) => {
    const { nextEpochAt, currentEpoch, setNeedReload } = useEpoch();

    return (
        <EpochContext.Provider value={{nextEpochAt, currentEpoch, setNeedReload}}>
            { children }
        </EpochContext.Provider>
    );
}

export const useEpochState = () => useContext(EpochContext);