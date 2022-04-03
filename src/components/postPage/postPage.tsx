import { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Page, Params, Post } from '../../constants'
import PostBlock from '../postBlock/postBlock'
import BasicPage from '../basicPage/basicPage'
import './postPage.scss'
import PostContext from '../../context/Post'
import { observer } from 'mobx-react-lite'

const PostPage = () => {
    const { id } = useParams<Params>()
    const postContext = useContext(PostContext)

    useEffect(() => {
        if (!postContext.postsById[id]) {
            postContext.loadPost(id)
        }
    }, [])

    return (
        <BasicPage>
            {!postContext.postsById[id] ? (
                <div>Loading...</div>
            ) : (
                <PostBlock post={postContext.postsById[id]} page={Page.Post} />
            )}
        </BasicPage>
    )
}

export default observer(PostPage)
