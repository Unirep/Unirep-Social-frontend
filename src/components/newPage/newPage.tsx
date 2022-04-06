import { useEffect, useContext } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import UserContext from '../../context/User'
import QueueContext from '../../context/Queue'
import { WebContext } from '../../context/WebContext'
import './newPage.scss'

import WritingField from '../writingField/writingField'
import BasicPage from '../basicPage/basicPage'
import { DataType } from '../../constants'

const NewPage = () => {
    const { setDraft } = useContext(WebContext)
    const history = useHistory()
    const location = useLocation<Location>()
    const state = JSON.parse(JSON.stringify(location.state))
    const isConfirmed = state.isConfirmed
    const userContext = useContext(UserContext)
    const queue = useContext(QueueContext)

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
        if (!userContext.userState) {
            console.log('not login yet.')
        } else {
            const ret = queue.publishPost(title, content, epkNonce, reputation)
            if (ret) {
                setDraft('')
                history.push('/')
            } else {
                console.log('post failed')
            }
        }
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

export default observer(NewPage)
