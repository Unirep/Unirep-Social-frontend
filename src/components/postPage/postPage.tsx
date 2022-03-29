import { useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import PostContext from '../../context/Post'
import './postPage.scss'

import { Page, Params, Post } from '../../constants'
import PostBlock from '../postBlock/postBlock'
import BasicPage from '../basicPage/basicPage'

const PostPage = () => {
    const { id } = useParams<Params>()
    const post = useContext(PostContext)

    useEffect(() => {
        post.loadPost(id)
    }, [])

    return (
        <BasicPage>
            {post.postsById[id] === undefined ? (
                <div>No such post with id {id}.</div>
            ) : (
                <PostBlock post={post.postsById[id]} page={Page.Post} />
            )}
        </BasicPage>
    )
}

export default observer(PostPage)
