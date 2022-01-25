import { useContext, useState } from 'react';
import { WebContext } from '../../context/WebContext';
import { Post } from '../../constants';

type Props = {
    post: Post,
    ranking: number,
    hasUnderline: boolean,
}

const isAuthor = (p: Post, epks: undefined | string[]) => {
    if (epks !== undefined) {
        return epks.indexOf(p.epoch_key) > -1;
    } else {
        return false;
    }
}

const RankingBlock = ({ post, ranking, hasUnderline }: Props) => {
    const { user } = useContext(WebContext);
    
    return (
        <div className={hasUnderline ? "ranking-block underline" : "ranking-block"}>
            <div className="ranking-block-header">
                <div className="ranking">
                    <img src="/images/boost-fill.svg" />
                    {`#${ranking+1}${isAuthor(post, user?.all_epoch_keys)? ', by you':''}`}
                </div>
                <div className="boost">
                    {post.upvote}
                </div>
            </div>
            <div className="ranking-block-content">{post.content}</div>
        </div>
    );
}

type RankedPost = {
    post: Post,
    rank: number
}

const PostsWidget = () => {
    const { shownPosts, user } = useContext(WebContext);
    const [ posts, setPosts ] = useState<RankedPost[]>(() => {
        let posts: RankedPost[] = [];

        const sortedPosts = shownPosts.sort((a, b) => a.upvote > b.upvote? -1 : 1);
        let hasUserPost: boolean = false;
        sortedPosts.forEach((post, i) => {
            if (i < 3) {
                console.log('i < 3, add post! ' + i);
                const p = {post, rank: i}
                posts = [...posts, p];
            } else {
                console.log('i >= 3, check post!');
                console.log(i);
                if (!hasUserPost && isAuthor(post, user?.all_epoch_keys)) {
                    const p = {post, rank: i}
                    posts = [...posts, p];
                }
            }
            hasUserPost = hasUserPost || isAuthor(post, user?.all_epoch_keys);
        });

        return posts;
    });  // top3 and 1 your most popular post, if yours is in the top3 or you don't have post, then only 3 posts or less.

    return (
        <div className="posts-widget widget">
            <h3>Post ranking</h3>
            {
                posts.map((post, i) => <RankingBlock post={post.post} ranking={post.rank} hasUnderline={i < posts.length-1} key={i} />)
            }
        </div>
    );
}

export default PostsWidget;