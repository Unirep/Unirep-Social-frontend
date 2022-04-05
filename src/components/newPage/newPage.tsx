import { useEffect, useContext } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import './newPage.scss'
import WritingField from '../writingField/writingField'
import BasicPage from '../basicPage/basicPage'
import { DataType } from '../../constants'
import UserContext from '../../context/User'
import { observer } from 'mobx-react-lite'
import QueueContext from '../../context/Queue'
import { publishPost } from '../../utils'
import PostContext from '../../context/Post'
import { QueryType } from '../../constants'
import { WebContext } from '../../context/WebContext'

const NewPage = () => {
    const { setDraft } = useContext(WebContext)
    const history = useHistory()
    const location = useLocation<Location>()
    const state = JSON.parse(JSON.stringify(location.state))
    const isConfirmed = state.isConfirmed
    const userContext = useContext(UserContext)
    const queue = useContext(QueueContext)
    const postContext = useContext(PostContext)

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
            queue.addOp(
                async (updateStatus) => {
                    updateStatus({
                        title: 'Creating post',
                        details: 'Generating zk proof...',
                    })
                    const proofData = await userContext.genRepProof(
                        reputation,
                        reputation,
                        epkNonce
                    )
                    updateStatus({
                        title: 'Creating post',
                        details: 'Waiting for TX inclusion...',
                    })
                    const { transaction } = await publishPost(
                        proofData,
                        reputation,
                        content,
                        title
                    )
                    await queue.afterTx(transaction)
                    await postContext.loadFeed(QueryType.New)
                },
                {
                    successMessage: 'Post is finalized',
                }
            )
        }
        setDraft('')
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
