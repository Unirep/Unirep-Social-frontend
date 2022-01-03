import { useContext } from 'react';
import { WebContext } from '../../context/WebContext';
import { Post } from '../../constants';

type Props = {
    post: Post,
    ranking: number,
    hasUnderline: boolean,
}

const RankingBlock = ({ post, ranking, hasUnderline }: Props) => {
    return (
        <div className={hasUnderline ? "ranking-block underline" : "ranking-block"}>
            <div className="ranking-block-header">
                <div className="ranking">
                    <img src="/images/boost-fill.png" />
                    {`#${ranking}${post.isAuthor? ', by you':''}`}
                </div>
                <div className="boost">
                    {post.upvote}
                </div>
            </div>
            <div className="ranking-block-content">{post.content}</div>
        </div>
    );
}

const PostsWidget = () => {
    const { shownPosts } = useContext(WebContext);

    const setPostsRanking = () => {
        let posts: Post[] = [];
        let ranking: number[] = [];

        const sortedPosts = shownPosts.sort((a, b) => a.upvote > b.upvote? 1 : -1);
        let hasUserPost: boolean = false;
        sortedPosts.forEach((post, i) => {
            if (i < 3) {
                console.log('i < 3, add post! ' + i);
                posts = [...posts, post];
                ranking = [...ranking, i+1];
            } else {
                console.log('i >= 3, check post!');
                console.log(i);
                if (!hasUserPost && post.isAuthor) {
                    posts = [...posts, post];
                    ranking = [...ranking, i+1];
                }
            }
            hasUserPost = hasUserPost || post.isAuthor;
        });

        return {posts, ranking};
    }

    // top3 and 1 your most popular post, if yours is in the top3 or you don't have post, then only 3 posts or less.
    const { posts, ranking } = setPostsRanking();

    return (
        <div className="posts-widget widget">
            <h3>Post ranking</h3>
            {
                posts.map((post, i) => <RankingBlock post={post} ranking={ranking[i]} hasUnderline={i < posts.length-1} key={i} />)
            }
        </div>
    );
}

export default PostsWidget;