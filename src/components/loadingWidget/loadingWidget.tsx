import { useState, useContext, useEffect } from 'react'
import { HashLink as Link } from 'react-router-hash-link'

import './loadingWidget.scss'
import { WebContext } from '../../context/WebContext'
import UnirepContext from '../../context/Unirep'
import UserContext from '../../context/User'

import {
    publishPost,
    vote,
    leaveComment,
    getEpochSpent,
    userStateTransition,
    getUserState,
    getEpochKeys,
    getLatestBlock,
} from '../../utils'
import { ActionType } from '../../constants'
import * as config from '../../config'
import { getPostById } from '../../utils'


enum LoadingState {
    loading,
    success,
    failed,
    none,
}

const LoadingWidget = () => {
    const {
        isLoading,
        setIsLoading,
        action,
        setAction,
        tx,
        setTx,
        setNextUSTTime,
        setDraft,
        shownPosts,
        setShownPosts,
    } = useContext(WebContext)
    const user = useContext(UserContext)
    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.none
    )
    const [isFlip, setFlip] = useState<boolean>(false)
    const [goto, setGoto] = useState<string>('')
    const unirepConfig = useContext(UnirepContext)

    const doUST = async () => {
        await unirepConfig.loadingPromise
        let USTData: any = null
        USTData = await userStateTransition(
            action.data.identity,
            action.data.userState
        )
        if (USTData?.transaction) {
            await config.DEFAULT_ETH_PROVIDER.waitForTransaction(
                USTData.transaction
            )
        }

        let newUser
        if (user !== null && user.identity) { // reload user to local storage
            const userStateResult = await getUserState(user.identity)
            const epks = getEpochKeys(
                user.identity,
                userStateResult.currentEpoch
            )
            const rep = userStateResult.userState.getRepByAttester(
                BigInt(unirepConfig.attesterId)
            )
            if (USTData !== undefined) {
                newUser = {
                    ...user,
                    epoch_keys: epks,
                    reputation: Number(rep.posRep) - Number(rep.negRep),
                    current_epoch: USTData.toEpoch,
                    spent: 0,
                    userState: userStateResult.userState.toJSON(),
                    all_epoch_keys: [...user.allEpks, ...epks],
                }
                USTData = { ...USTData, user: newUser }
            }
            if (USTData.error !== undefined) return USTData
            const { error } = await user.getAirdrop()
            if (error !== undefined) {
                USTData = { ...USTData, error }
            }
        }

        return USTData
    }

    useEffect(() => {
        const doAction = async () => {
            setIsLoading(true)
            console.log('Todo action: ' + JSON.stringify(action))
            setLoadingState(LoadingState.loading)
            // wait latest transaction
            if (tx?.length) {
                const receipt =
                    await config.DEFAULT_ETH_PROVIDER.waitForTransaction(tx)
                const latestProcessedBlock = await getLatestBlock()
                if (receipt && latestProcessedBlock < receipt?.blockNumber) {
                    console.log(
                        'block ' +
                            latestProcessedBlock +
                            " hasn't been processed"
                    )
                    setLoadingState(LoadingState.failed)
                    setIsLoading(false)
                    return
                }
            }

            const next = await unirepConfig.nextEpochTime()
            setNextUSTTime(next)

            let data: any = {}
            let newUser: any = undefined
            let spentRet = await getEpochSpent(user ? user.allEpks : [])

            if (user !== null && user !== undefined) {
                const currentEpoch = parseInt(await unirepConfig.currentEpoch())
                const userEpoch = user.currentEpoch
                if (currentEpoch !== userEpoch) {
                    console.log(
                        'user epoch is not the same as current epoch, do user state transition, ' +
                            userEpoch +
                            ' != ' +
                            currentEpoch
                    )
                    data = await doUST()
                    newUser = data.user

                    if (data.error !== undefined) {
                        console.log(data.error)
                        // setUser({ ...newUser, spent: 0 })
                        setGoto('/')
                        setLoadingState(LoadingState.failed)
                        setIsLoading(false)
                        return
                    }

                    spentRet = 0
                }
            }

            console.log('in the head of loading widget, spent is: ' + spentRet)

            if (action.action === ActionType.Post) {
                data = await publishPost(
                    action.data.content,
                    action.data.epkNonce,
                    action.data.identity,
                    action.data.reputation,
                    spentRet,
                    action.data.userState,
                    action.data.title
                )
                spentRet += unirepConfig.postReputation
            } else if (action.action === ActionType.Comment) {
                data = await leaveComment(
                    action.data.identity,
                    action.data.content,
                    action.data.data,
                    action.data.epkNonce,
                    action.data.reputation,
                    spentRet,
                    action.data.userState
                )
                spentRet += unirepConfig.commentReputation
            } else if (action.action === ActionType.Vote) {
                if (action.data.isPost) {
                    data = await vote(
                        action.data.identity,
                        action.data.upvote,
                        action.data.downvote,
                        action.data.data,
                        action.data.epk,
                        action.data.epkNonce,
                        action.data.upvote + action.data.downvote,
                        action.data.isPost,
                        spentRet,
                        action.data.userState
                    )
                } else {
                    data = await vote(
                        action.data.identity,
                        action.data.upvote,
                        action.data.downvote,
                        action.data.data.split('_')[1],
                        action.data.epk,
                        action.data.epkNonce,
                        action.data.upvote + action.data.downvote,
                        action.data.isPost,
                        spentRet,
                        action.data.userState
                    )
                }

                spentRet += action.data.upvote + action.data.downvote
            } else if (action.action === ActionType.UST) {
                console.log('already check epoch and do ust...')
            }

            if (user !== null) {
                if (newUser === undefined) {
                    // setUser({ ...user, spent: spentRet })
                } else {
                    // setUser({ ...newUser, spent: spentRet })
                }
            }

            if (data.error !== undefined) {
                console.log('action ' + action.action + ' error: ' + data.error)
                setLoadingState(LoadingState.failed)
                setIsLoading(false)
                return
            } else {
                console.log('without error.')
                setDraft(null)
                setLoadingState(LoadingState.success)
            }

            let pid: string = ''
            if (action.action === ActionType.Post) {
                setGoto(
                    data.error === undefined
                        ? '/post/' + data.transaction
                        : '/new'
                )
                pid = data.transaction
            } else if (action.action === ActionType.Vote) {
                setGoto('/post/' + action.data.data.replace('_', '#'))
                pid = action.data.data.split('_')[0]
            } else if (action.action === ActionType.Comment) {
                setGoto(
                    data.error === undefined
                        ? '/post/' + action.data.data + '#' + data.transaction
                        : '/post/' + action.data.data
                )
                pid = action.data.data
            } else if (action.action === ActionType.UST) {
                setGoto('/')
            }
            setTx(data.transaction)

            if (pid.length > 0) {
                const postRet = await getPostById(pid)
                let newShownPosts = shownPosts.map((p) =>
                    p.id === pid ? postRet : p
                )
                setShownPosts(newShownPosts)
            }

            setIsLoading(false)
        }

        if (action !== null && user !== null && !isLoading) {
            console.log('do action')
            doAction()
        }
    }, [action])

    useEffect(() => {
        const timer = setTimeout(() => {
            setFlip(!isFlip)
        }, 500)

        return () => clearTimeout(timer)
    }, [isFlip])

    useEffect(() => {
        if (user === null) {
            resetLoading()
        }
    }, [user])

    const resetLoading = () => {
        if (loadingState === LoadingState.loading) {
            return
        }
        setAction(null)
        setLoadingState(LoadingState.none)
    }

    const gotoEtherscan = (event: any) => {
        event.stopPropagation()
        resetLoading()
    }

    return (
        <div className="loading-widget" onClick={resetLoading}>
            {loadingState === LoadingState.none ? (
                <div></div>
            ) : loadingState === LoadingState.loading ? (
                <div className="loading-block">
                    <img
                        src={require('../../../public/images/loader.svg')}
                        style={{ transform: `scaleX(${isFlip ? '-1' : '1'})` }}
                    />
                    <span>Submitting your content...</span>
                    <div className="info-row">
                        Please wait 'til this transaction complete for creating
                        post, comment, boost, or squash. This is the life of
                        blockchain :P{' '}
                    </div>
                </div>
            ) : loadingState === LoadingState.success ? (
                <div className="loading-block">
                    <img
                        src={require('../../../public/images/checkmark.svg')}
                    />
                    <span>
                        {action.action === ActionType.Post
                            ? 'Post is finalized'
                            : action.action === ActionType.Comment
                            ? 'Comment is finalized'
                            : action.action === ActionType.Vote
                            ? 'Succeed!'
                            : ''}
                    </span>
                    {action.action === ActionType.UST ? (
                        <div className="info-row">
                            User State Transition done.
                        </div>
                    ) : (
                        <div className="info-row">
                            <Link className="link" to={goto}>
                                See my content
                            </Link>{' '}
                            |{' '}
                            <a
                                className="link"
                                target="_blank"
                                href={'https://goerli.etherscan.io/tx/' + tx}
                            >
                                Etherscan{' '}
                                <img
                                    src={require('../../../public/images/etherscan-white.svg')}
                                />
                            </a>
                        </div>
                    )}
                </div>
            ) : loadingState === LoadingState.failed ? (
                <div className="loading-block failed">
                    <img
                        src={require('../../../public/images/close-red.svg')}
                    />
                    <span>Posting to blockchain failed.</span>
                    <div className="info-row">
                        <Link className="link failed" to={goto}>
                            See my content
                        </Link>
                    </div>
                </div>
            ) : (
                <div></div>
            )}
        </div>
    )
}

export default LoadingWidget
