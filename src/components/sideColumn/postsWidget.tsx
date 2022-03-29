import { useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import UserContext from '../../context/User'
import PostContext from '../../context/Post'
import { Post, QueryType } from '../../constants'

type Props = {
    post: Post
    ranking: number
    hasUnderline: boolean
}

const isAuthor = (p: Post, epks: undefined | string[]) => {
    if (epks !== undefined) {
        return epks.indexOf(p.epoch_key) > -1
    } else {
        return false
    }
}

const RankingBlock = ({ post, ranking, hasUnderline }: Props) => {
    const user = useContext(UserContext)
    const history = useHistory()

    return (
        <div
            className={
                hasUnderline ? 'ranking-block underline' : 'ranking-block'
            }
            onClick={() => history.push('/post/' + post.id)}
        >
            <div className="ranking-block-header">
                <div className="ranking">
                    <img
                        src={require('../../../public/images/boost-fill.svg')}
                    />
                    {`#${ranking + 1}${
                        isAuthor(post, user.allEpks) ? ', by you' : ''
                    }`}
                </div>
                <div className="boost">{post.upvote}</div>
            </div>
            <div className="ranking-block-content">
                <h4>{post.title}</h4>
                <p>{post.content}</p>
            </div>
        </div>
    )
}

type RankedPost = {
    post: Post
    rank: number
}

const PostsWidget = () => {
    const user = useContext(UserContext)
    const postController = useContext(PostContext)
    const [posts, setPosts] = useState<RankedPost[]>([])

    useEffect(() => {
        const loadRankedPosts = async () => {
            await postController.loadFeed(QueryType.Boost)

            let hasUserPost: boolean = false
            let rankedPosts: RankedPost[] = []
            const unrankedPosts =
                postController.feedsByQuery[QueryType.Boost] ?? []
            unrankedPosts.forEach((post, i) => {
                if (i < 3) {
                    // console.log('i < 3, add post! ' + i);
                    const p = { post, rank: i }
                    rankedPosts = [...posts, p]
                } else {
                    if (!hasUserPost && isAuthor(post, user.allEpks)) {
                        const p = { post, rank: i }
                        rankedPosts = [...posts, p]
                    }
                }
                hasUserPost = hasUserPost || isAuthor(post, user.allEpks)
            })

            setPosts(rankedPosts)
        }

        loadRankedPosts()
    }, [])

    return (
        <div className="posts-widget widget">
            <h3>Post ranking</h3>
            {posts.map((post, i) => (
                <RankingBlock
                    post={post.post}
                    ranking={post.rank}
                    hasUnderline={i < posts.length - 1}
                    key={i}
                />
            ))}
        </div>
    )
}

export default PostsWidget
