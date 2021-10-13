import { createContext } from 'react';
import { UserPageType } from '../constants';

type UserPageContent = {
    page: UserPageType,
    switchPage: (page: UserPageType) => void,
    isPostFieldActive: boolean;
    setIsPostFieldActive: (value: boolean) => void;
}

export const UserPageContext = createContext<UserPageContent>({
    page: UserPageType.Posts,
    switchPage: () => {},
    isPostFieldActive: false,
    setIsPostFieldActive: () => {},
});