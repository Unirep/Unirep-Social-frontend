import { useEffect, useContext } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import './newPage.scss'
import { WebContext } from '../../context/WebContext'
import WritingField from '../writingField/writingField'
import BasicPage from '../basicPage/basicPage'
import { DataType, ActionType } from '../../constants'
import UserContext from '../../context/User'
import { observer } from 'mobx-react-lite'

const NewPage = () => {
    const history = useHistory()
    const location = useLocation<Location>()
    const state = JSON.parse(JSON.stringify(location.state))
    const isConfirmed = state.isConfirmed
    const userContext = useContext(UserContext)

    const { setAction } = useContext(WebContext)

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
        if (!userContext.userState) {
            console.log('not login yet.')
        } else {
            const actionData = {
                title,
                content,
                epkNonce,
                identity: userContext.identity,
                reputation,
                spent: userContext.spent,
            }
            setAction({ action: ActionType.Post, data: actionData })
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

export default observer(NewPage)
