import { useState, useContext, useEffect } from 'react'
import { HashLink as Link } from 'react-router-hash-link'

import './loadingWidget.scss'
import { WebContext } from '../../context/WebContext'
import { publishPost, vote, leaveComment, getLatestBlock } from '../../utils'
import { ActionType } from '../../constants'
import * as config from '../../config'
import { getPostById } from '../../utils'
import UnirepContext from '../../context/Unirep'
import UserContext from '../../context/User'
import EpochContext from '../../context/EpochManager'

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
        setDraft,
        shownPosts,
        setShownPosts,
    } = useContext(WebContext)
    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.none
    )
    const [isFlip, setFlip] = useState<boolean>(false)
    const [goto, setGoto] = useState<string>('')
    const unirepConfig = useContext(UnirepContext)
    const userContext = useContext(UserContext)
    const epochManager = useContext(EpochContext)

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

            if (!userContext.userState) {
                throw new Error('User state is not initialized')
            }
            const currentEpoch = parseInt(await unirepConfig.currentEpoch())
            if (currentEpoch > userContext.userState.latestTransitionedEpoch) {
                console.log(
                    'user epoch is not the same as current epoch, do user state transition, ' +
                        userContext.userState.latestTransitionedEpoch +
                        ' != ' +
                        currentEpoch
                )
                const { transaction } = await userContext.userStateTransition()
                if (transaction) {
                    await config.DEFAULT_ETH_PROVIDER.waitForTransaction(
                        transaction
                    )
                }
                await epochManager.updateWatch()
                await userContext.getAirdrop()
            }
            // generate the proof here and then pass to api call fn
            const amount =
                action.data.reputation ||
                action.data.upvote + action.data.downvote
            const proofData = await userContext.genRepProof(amount, amount)
            let data
            if (action.action === ActionType.Post) {
                data = await publishPost(
                    proofData,
                    amount,
                    action.data.content,
                    action.data.title
                )
            } else if (action.action === ActionType.Comment) {
                data = await leaveComment(
                    proofData,
                    amount,
                    action.data.content,
                    action.data.data
                )
            } else if (action.action === ActionType.Vote) {
                if (action.data.isPost) {
                    data = await vote(
                        proofData,
                        amount,
                        action.data.upvote,
                        action.data.downvote,
                        action.data.data,
                        action.data.epk,
                        action.data.isPost
                    )
                } else {
                    data = await vote(
                        proofData,
                        amount,
                        action.data.upvote,
                        action.data.downvote,
                        action.data.data.split('_')[1],
                        action.data.epk,
                        action.data.isPost
                    )
                }
            } else if (action.action === ActionType.UST) {
                console.log('already check epoch and do ust...')
            }

            if (data && data.error !== undefined) {
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
                    data && data.error === undefined
                        ? '/post/' + data.transaction
                        : '/new'
                )
                pid = data?.transaction
            } else if (action.action === ActionType.Vote) {
                setGoto('/post/' + action.data.data.replace('_', '#'))
                pid = action.data.data.split('_')[0]
            } else if (action.action === ActionType.Comment) {
                setGoto(
                    data?.error === undefined
                        ? '/post/' + action.data.data + '#' + data?.transaction
                        : '/post/' + action.data.data
                )
                pid = action.data.data
            } else if (action.action === ActionType.UST) {
                setGoto('/')
            }
            setTx(data?.transaction)

            if (pid.length > 0) {
                const postRet = await getPostById(pid)
                let newShownPosts = shownPosts.map((p) =>
                    p.id === pid ? postRet : p
                )
                setShownPosts(newShownPosts)
            }

            setIsLoading(false)
        }

        if (action !== null && !isLoading) {
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
