import { createContext } from 'react';
import { Post } from '../constants';

type PostPageContent = {
    isPostPageUpVoteBoxOn: boolean;
    setIsPostPageUpVoteBoxOn: (value: boolean) => void;
    isPostPageDownVoteBoxOn: boolean;
    setIsPostPageDownVoteBoxOn: (value: boolean) => void;
    postPageVoteReceiver: null | Post | Comment;
    setPostPageVoteReceiver: (value: any) => void;
}

export const PostPageContext = createContext<PostPageContent>({
    isPostPageUpVoteBoxOn: false,
    setIsPostPageUpVoteBoxOn: () => {},
    isPostPageDownVoteBoxOn: false,
    setIsPostPageDownVoteBoxOn: () => {},
    postPageVoteReceiver: null,
    setPostPageVoteReceiver: () => {},
});