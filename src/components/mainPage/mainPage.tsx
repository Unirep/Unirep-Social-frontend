import { useContext, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { QueryType, AlertType } from '../../constants'
import BasicPage from '../basicPage/basicPage'
import PostsList from '../postsList/postsList'
import Feed from '../feed/feed'
import './mainPage.scss'
import PostContext from '../../context/Post'
import UserContext from '../../context/User'
import { observer } from 'mobx-react-lite'
import UnirepContext from '../../context/Unirep'

const MainPage = () => {
    const history = useHistory()
    const posts = useContext(PostContext)
    const userContext = useContext(UserContext)
    const unirepConfig = useContext(UnirepContext)

    const [query, setQuery] = useState<QueryType>(QueryType.New)

    const loadMorePosts = () => {
        console.log(
            'load more posts, now posts: ' + posts.feedsByQuery[query]?.length
        )
        const lastPost = [...posts.feedsByQuery[query]].pop()
        posts.loadFeed(query, lastPost?.id)
    }

    useEffect(() => {
        posts.loadFeed(query)
    }, [query])

    const gotoNewPost = () => {
        if (
            userContext.userState &&
            userContext.netReputation >= unirepConfig.postReputation
        ) {
            history.push('/new', { isConfirmed: true })
        }
    }

    return (
        <BasicPage>
            <div className="create-post" onClick={gotoNewPost}>
                {!userContext.userState
                    ? AlertType.postNotLogin
                    : userContext.netReputation < unirepConfig.postReputation
                    ? AlertType.postNotEnoughPoints
                    : 'Create post'}
            </div>
            <Feed feedChoice={query} setFeedChoice={setQuery} />
            <PostsList
                posts={posts.feedsByQuery[query] || []}
                loadMorePosts={loadMorePosts}
            />
        </BasicPage>
    )
}

export default observer(MainPage)
