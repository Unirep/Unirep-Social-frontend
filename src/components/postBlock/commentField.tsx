import { WebContext } from '../../context/WebContext'
import { useState, useContext } from 'react'
import { Post, Comment, DataType, Page, ActionType } from '../../constants'
import WritingField from '../writingField/writingField'

type Props = {
    post: Post
    closeComment: () => void
    page: Page
}

const CommentField = (props: Props) => {
    const { user, isLoading, setIsLoading, setAction } = useContext(WebContext)

    const preventPropagation = (event: any) => {
        event.stopPropagation()
    }

    const submitComment = async (
        title: string = '',
        content: string,
        epkNonce: number,
        reputation: number
    ) => {
        if (user === null) {
            console.error('user not login!')
        } else if (content.length === 0) {
            console.error('nothing happened, no input.')
        } else {
            const actionData = {
                identity: user.identity,
                content,
                data: props.post.id,
                epkNonce,
                reputation,
                spent: user.spent,
                userState: user.userState,
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

export default CommentField
