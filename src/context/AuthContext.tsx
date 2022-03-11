import { createContext, useContext, useState } from 'react';
import { User } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';

type AuthContent = {
    user: User | null;
    setUser: (_: User | null) => void;
}

const AuthContext = createContext<AuthContent>({
    user: null,
    setUser: () => {}
});

type Props = {
    currentUser: User | null;
    children: any;
}

export const AuthProvider = ({ currentUser, children }: Props) => {
    const [user, setUser] = useLocalStorage('user', currentUser);

    return (
        <AuthContext.Provider value={{user, setUser}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);