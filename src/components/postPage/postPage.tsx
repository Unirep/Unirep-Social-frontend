import { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { WebContext } from '../../context/WebContext'
import { Page, Params, Post } from '../../constants'
import PostBlock from '../postBlock/postBlock'
import SideColumn from '../sideColumn/sideColumn'
import { getPostById } from '../../utils'
import './postPage.scss'

const PostPage = () => {
    const { id } = useParams<Params>()
    const { shownPosts, setShownPosts } = useContext(WebContext)

    const setPost = async () => {
        let ret: any = null
        try {
            ret = await getPostById(id)
            setShownPosts([ret])
        } catch (e) {
            setShownPosts([])
        }
    }

    useEffect(() => {
        setPost()
    }, [])

    return (
        <div className="body-columns">
            <div className="margin-box"></div>
            <div className="content">
                <div className="main-content">
                    {shownPosts.length === 0 ? (
                        <div>No such post with id {id}.</div>
                    ) : (
                        <PostBlock post={shownPosts[0]} page={Page.Post} />
                    )}
                </div>
                <div className="side-content">
                    <SideColumn page={Page.Post} />
                </div>
            </div>
            <div className="margin-box"></div>
        </div>
    )
}

export default PostPage
