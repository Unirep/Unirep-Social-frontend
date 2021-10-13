import { createContext } from 'react';
import { Post, User, PageStatus } from '../constants';

type GlobalContent = {
    user: User | null;
    setUser: (u: User | null) => void;
    pageStatus: PageStatus;
    setPageStatus: (p: PageStatus) => void;
    shownPosts: Post[];
    setShownPosts: (posts: Post[]) => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    nextUSTTime: number;
    setNextUSTTime: (value: number) => void;
}

export const WebContext = createContext<GlobalContent>({
    user: null,
    setUser: () => {},
    pageStatus: PageStatus.None,
    setPageStatus: () => {},
    shownPosts: [],
    setShownPosts: () => {},
    isLoading: false,
    setIsLoading: () => {},
    nextUSTTime: 4789220745000,
    setNextUSTTime: () => {},
});