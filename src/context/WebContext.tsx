import { createContext } from 'react';
import { Post, Draft } from '../constants';

type GlobalContent = {
    shownPosts: Post[];
    setShownPosts: (posts: Post[]) => void;
    nextUSTTime: number;
    setNextUSTTime: (value: number) => void;
    action: any;
    setAction: (value: any) => void;
    adminCode: string;
    setAdminCode: (value: string) => void;
    draft: null | Draft;
    setDraft: (value: any) => void;
}

export const WebContext = createContext<GlobalContent>({
    shownPosts: [],
    setShownPosts: () => {},
    nextUSTTime: 4789220745000,
    setNextUSTTime: () => {},
    action: null,
    setAction: () => {},
    adminCode: '', 
    setAdminCode: () => {},
    draft: null,
    setDraft: () => {},
});