import { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import './postsList.scss'

import PostBlock from '../postBlock/postBlock'
import { Page } from '../../constants'
import { LOAD_POST_COUNT } from '../../config'
import PostContext from '../../context/Post'

type Props = {
    postIds: string[]
    loadMorePosts: () => void
}

const PostsList = ({ postIds, loadMorePosts }: Props) => {
    const postContext = useContext(PostContext)
    return (
        <div className="post-list">
            {postIds.length > 0 ? (
                postIds.map((id, i) => (
                    <PostBlock
                        key={id}
                        post={postContext.postsById[id]}
                        page={Page.Home}
                    />
                ))
            ) : (
                <div className="no-posts">
                    <img src={require('../../../public/images/glasses.svg')} />
                    <p>
                        It's empty here.
                        <br />
                        People just being shy, no post yet.
                    </p>
                </div>
            )}
            {postIds.length > 0 && postIds.length % LOAD_POST_COUNT === 0 ? (
                <div className="load-more-button" onClick={loadMorePosts}>
                    Load more posts
                </div>
            ) : (
                <div></div>
            )}
        </div>
    )
}

export default observer(PostsList)
