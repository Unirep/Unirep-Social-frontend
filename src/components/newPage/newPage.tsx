import { useEffect, useContext } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import './newPage.scss'
import { WebContext } from '../../context/WebContext'
import UserContext from '../../context/User'
import PostContext from '../../context/Post'

import WritingField from '../writingField/writingField'
import BasicPage from '../basicPage/basicPage'
import { DataType, ActionType } from '../../constants'

const NewPage = () => {
    const history = useHistory()
    const location = useLocation<Location>()
    const state = JSON.parse(JSON.stringify(location.state))
    const isConfirmed = state.isConfirmed

    const { setIsLoading } = useContext(WebContext)
    const user = useContext(UserContext)
    const postController = useContext(PostContext)

    useEffect(() => {
        console.log('Is this new page being confirmd? ' + isConfirmed)
    }, [])

    const preventPropagation = (event: any) => {
        event.stopPropagation()
    }

    const submit = async (
        title: string,
        content: string,
        epkNonce: number,
        reputation: number
    ) => {
        console.log('submit post')
        setIsLoading(true)

        const ret = await user.genProof(epkNonce, reputation)
        if (!ret) {
            console.log('gen proof error')
        } else {
            const postRet = await postController.publishPost(title, content, reputation, ret.proof, ret.publicSignals)
            if (!postRet) {
                console.log('publish post error')
            } else {
                console.log('publish post return: ' + JSON.stringify(postRet))
            }
        }

        setIsLoading(false)
        history.push('/')
    }

    return (
        <BasicPage>
            <h3>Create post</h3>
            <WritingField
                type={DataType.Post}
                submit={submit}
                submitBtnName="Post - 5 points"
                onClick={preventPropagation}
            />
        </BasicPage>
    )
}

export default NewPage
