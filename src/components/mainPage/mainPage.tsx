import { useContext, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import { getPostsByQuery } from '../../utils'
import { WebContext } from '../../context/WebContext'
import { Page, QueryType, AlertType } from '../../constants'
import { DEFAULT_POST_KARMA } from '../../config'
import SideColumn from '../sideColumn/sideColumn'
import PostsList from '../postsList/postsList'
import Banner from './banner'
import Feed from '../feed/feed'
import './mainPage.scss'

const MainPage = () => {
    const history = useHistory()

    const { shownPosts, setShownPosts, isLoading, user } =
        useContext(WebContext)

    const [query, setQuery] = useState<QueryType>(QueryType.New)
    const [showBanner, setShowBanner] = useState<Boolean>(true)

    const getPosts = async (lastRead: string = '0') => {
        console.log(
            'get posts with last read: ' + lastRead + ', query is: ' + query
        )
        const sortedPosts = await getPostsByQuery(query, lastRead)
        if (lastRead === '0') {
            setShownPosts(sortedPosts)
        } else {
            setShownPosts([...shownPosts, ...sortedPosts])
        }
    }

    const loadMorePosts = () => {
        console.log('load more posts, now posts: ' + shownPosts.length)
        if (shownPosts.length > 0) {
            getPosts(shownPosts[shownPosts.length - 1].id)
        } else {
            getPosts()
        }
    }

    useEffect(() => {
        getPosts()
    }, [query])

    const gotoNewPost = () => {
        if (
            !isLoading &&
            user !== null &&
            user.reputation - user.spent >= DEFAULT_POST_KARMA
        ) {
            history.push('/new', { isConfirmed: true })
        }
    }

    return (
        <div className="body-columns">
            <div className="margin-box"></div>
            <div className="content">
                {showBanner ? (
                    <Banner closeBanner={() => setShowBanner(false)} />
                ) : (
                    <div></div>
                )}
                <div className="main-content">
                    <div className="create-post" onClick={gotoNewPost}>
                        {user === null
                            ? AlertType.postNotLogin
                            : user.reputation - user.spent < DEFAULT_POST_KARMA
                            ? AlertType.postNotEnoughPoints
                            : 'Create post'}
                    </div>
                    <Feed feedChoice={query} setFeedChoice={setQuery} />
                    <div>
                        <PostsList
                            posts={shownPosts}
                            loadMorePosts={loadMorePosts}
                        />
                    </div>
                </div>
                <div className="side-content">
                    <SideColumn page={Page.Home} />
                </div>
            </div>
            <div className="margin-box"></div>
        </div>
    )
}

export default MainPage
