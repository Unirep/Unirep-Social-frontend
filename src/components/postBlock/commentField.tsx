import { useState, useContext } from 'react'
import { Post, Comment, DataType, Page } from '../../constants'
import WritingField from '../writingField/writingField'
import UserContext from '../../context/User'
import { observer } from 'mobx-react-lite'
import QueueContext from '../../context/Queue'
import { leaveComment } from '../../utils'
import { WebContext } from '../../context/WebContext'

type Props = {
    post: Post
    closeComment: () => void
    page: Page
}

const CommentField = (props: Props) => {
    const userContext = useContext(UserContext)
    const queue = useContext(QueueContext)
    const { setDraft } = useContext(WebContext)

    const preventPropagation = (event: any) => {
        event.stopPropagation()
    }

    const submitComment = async (
        title: string = '',
        content: string,
        epkNonce: number,
        reputation: number
    ) => {
        if (!userContext.userState) {
            console.error('user not login!')
        } else if (content.length === 0) {
            console.error('nothing happened, no input.')
        } else {
            const data = props.post.id
            queue.addOp(
                async () => {
                    const proofData = await userContext.genRepProof(
                        reputation,
                        reputation
                    )
                    await leaveComment(proofData, reputation, content, data)
                },
                {
                    successMessage: 'Comment is finalized!',
                }
            )
            setDraft('')
            props.closeComment()
        }
    }

    return (
        <div className="comment-field">
            <WritingField
                type={DataType.Comment}
                submit={submitComment}
                submitBtnName="Comment - 3 points"
                onClick={preventPropagation}
            />
        </div>
    )
}

export default observer(CommentField)
