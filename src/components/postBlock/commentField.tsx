import { WebContext } from '../../context/WebContext'
import { useState, useContext } from 'react'
import { Post, Comment, DataType, Page, ActionType } from '../../constants'
import WritingField from '../writingField/writingField'
import UserContext from '../../context/User'
import { observer } from 'mobx-react-lite'

type Props = {
    post: Post
    closeComment: () => void
    page: Page
}

const CommentField = (props: Props) => {
    const { isLoading, setIsLoading, setAction } = useContext(WebContext)
    const userContext = useContext(UserContext)

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
            const actionData = {
                identity: userContext.identity,
                content,
                data: props.post.id,
                epkNonce,
                reputation,
                spent: userContext.spent,
                userState: userContext.userState,
            }
            setAction({ action: ActionType.Comment, data: actionData })
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
