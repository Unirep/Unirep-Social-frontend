import { useEffect, useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Post, Comment, ButtonType } from '../../constants'
import { WebContext } from '../../context/WebContext'
import VoteBox from '../voteBox/voteBox'
import UserContext from '../../context/User'
import { observer } from 'mobx-react-lite'

type Props = {
    type: ButtonType
    count: number
    data: Post | Comment
}

const BlockButton = ({ type, count, data }: Props) => {
    const history = useHistory()
    const { isLoading } = useContext(WebContext)
    const userContext = useContext(UserContext)

    const [isBoostOn, setBoostOn] = useState<boolean>(false)
    const [isSquashOn, setSquashOn] = useState<boolean>(false)
    const [isHover, setIsHover] = useState<boolean>(false) // null, purple1, purple2, grey1, grey2
    const [reminder, setReminder] = useState<string>('')
    const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false) // only for share button

    const checkAbility = () => {
        if (type === ButtonType.Comments || type === ButtonType.Share) {
            return true
        } else {
            if (!userContext.userState) return false
            else {
                if (data.current_epoch !== userContext.currentEpoch)
                    return false
                else if (userContext.netReputation < 1) return false
                else if (isLoading) return false
                else return true
            }
        }
    }

    const [isAble, setIsAble] = useState<boolean>(() => checkAbility())

    const onClick = () => {
        if (isAble) {
            if (type === ButtonType.Comments) {
                history.push(`/post/${data.id}`, { commentId: '' })
            } else if (type === ButtonType.Boost) {
                setBoostOn(true)
            } else if (type === ButtonType.Squash) {
                setSquashOn(true)
            } else if (type === ButtonType.Share) {
                navigator.clipboard.writeText(
                    `https://unirep.social/post/${data.id}`
                )
                setIsLinkCopied(true)
            }
        }
        setIsHover(false)
    }

    const onMouseOut = () => {
        setIsHover(false)
        setReminder('')
    }

    const setReminderMessage = () => {
        if (!userContext.userState) setReminder('Join us :)')
        else {
            if (data.current_epoch !== userContext.currentEpoch)
                setReminder('Time out :(')
            else if (userContext.netReputation < 1) setReminder('No enough Rep')
            else if (isLoading && type !== ButtonType.Share)
                setReminder('loading...')
        }
    }

    useEffect(() => {
        if (isLinkCopied) {
            setReminder('Link Copied!')
            const timer = setTimeout(() => {
                setReminder('')
                setIsLinkCopied(false)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [isLinkCopied])

    useEffect(() => {
        if (isLoading) setIsAble(false)
        else setIsAble(checkAbility())
    }, [isLoading])

    return (
        <div
            className={
                type === ButtonType.Share
                    ? 'block-button share'
                    : 'block-button'
            }
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={onMouseOut}
            onClick={onClick}
        >
            <img
                src={require(`../../../public/images/${type}${
                    isHover && isAble ? '-fill' : ''
                }.svg`)}
            />
            {type !== ButtonType.Share ? (
                <span className="count">{count}</span>
            ) : (
                <span></span>
            )}
            <span className="btn-name">
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>

            {isAble ? (
                <div></div>
            ) : (
                <div
                    className="disabled"
                    onMouseEnter={setReminderMessage}
                ></div>
            )}
            {reminder.length > 0 ? (
                <div className="reminder">{reminder}</div>
            ) : (
                <div></div>
            )}
            {isBoostOn ? (
                <VoteBox
                    isUpvote={true}
                    data={data}
                    closeVote={() => setBoostOn(false)}
                />
            ) : isSquashOn ? (
                <VoteBox
                    isUpvote={false}
                    data={data}
                    closeVote={() => setSquashOn(false)}
                />
            ) : (
                <div></div>
            )}
        </div>
    )
}

export default observer(BlockButton)
