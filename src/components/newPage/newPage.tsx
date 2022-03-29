import { useEffect, useContext } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import './newPage.scss'
import { WebContext } from '../../context/WebContext'
import UserContext from '../../context/User'

import WritingField from '../writingField/writingField'
import BasicPage from '../basicPage/basicPage'
import { DataType, ActionType } from '../../constants'

const NewPage = () => {
    const history = useHistory()
    const location = useLocation<Location>()
    const state = JSON.parse(JSON.stringify(location.state))
    const isConfirmed = state.isConfirmed

    const { setAction } = useContext(WebContext)
    const user = useContext(UserContext)

    useEffect(() => {
        console.log('Is this new page being confirmd? ' + isConfirmed)
    }, [])

    const preventPropagation = (event: any) => {
        event.stopPropagation()
    }

    const submit = (
        title: string,
        content: string,
        epkNonce: number,
        reputation: number
    ) => {
        console.log('submit post')
        if (user.identity) {
            const actionData = {
                title,
                content,
                epkNonce,
                identity: user.identity,
                reputation,
                spent: user.spent,
            }
            setAction({ action: ActionType.Post, data: actionData })
        } else {
            console.log('not login yet.')
        }
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
