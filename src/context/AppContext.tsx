import { createContext, useContext, useState } from 'react';

type AppContent = {
    isPending: boolean;
    setIsPending: (_: boolean) => void;
    isOverlayOn: boolean;
    setIsOverlayOn: (_: boolean) => void;
}

const AppContext = createContext<AppContent>({
    isPending: false,
    setIsPending: () => {},
    isOverlayOn: false,
    setIsOverlayOn: () => {},
});

type Props = {
    children: any;
}

export const AppProvider = ({ children }: Props) => {
    const [isPending, setIsPending] = useState<boolean>(false);
    const [isOverlayOn, setIsOverlayOn] = useState<boolean>(false);

    return (
        <AppContext.Provider value={{isPending, setIsPending, isOverlayOn, setIsOverlayOn}}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppState = () => useContext(AppContext);

