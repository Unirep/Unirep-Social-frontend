import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { makeURL, publishPost, vote, leaveComment } from '../utils'
import { DEFAULT_ETH_PROVIDER } from '../config'
import UserContext from './User'

export enum LoadingState {
    loading,
    success,
    failed,
    none,
}

export enum ActionType {
    Post = 'Post',
    Comment = 'Comment',
    Vote = 'Vote',
    UST = 'UST',
    Signup = 'Signup',
}

interface Status {
    title?: string
    details?: string
}

type OperationFn = (
    updateStatus: (status: Status) => void
) => void | Promise<any>

interface Operation {
    fn: OperationFn
    successMessage: string
    failureMessage: string
    status?: Status
    type?: ActionType
}

const defaultStatus: Status = {
    title: 'Submitting your content',
    details: `Please wait 'til this transaction complete for creating post, comment, boost, or squash. This is the life of blockchain :P`,
}

class Queue {
    operations = [] as Operation[]
    loadingState = LoadingState.none
    latestMessage = ''
    status = defaultStatus
    daemonRunning = false
    private activeOp?: Operation

    constructor() {
        makeAutoObservable(this)
        if (typeof window !== 'undefined') {
            this.load()
        }
    }

    async load() {
        this.startDaemon()
    }

    get isLoading() {
        return this.loadingState === LoadingState.loading
    }

    queuedOp(type: ActionType) {
        if (this.activeOp && this.activeOp.type === type) return true
        return !!this.operations.find((o) => o.type === type)
    }

    async afterTx(tx: string) {
        const { blockNumber: target } =
            await DEFAULT_ETH_PROVIDER.waitForTransaction(tx)
        for (;;) {
            const r = await fetch(makeURL('/block'))
            const { blockNumber } = await r.json()
            if (blockNumber >= target) return
            await new Promise((r) => setTimeout(r, 2000))
        }
    }

    addOp(operation: OperationFn, options = {}) {
        this.operations.push({
            fn: operation,
            ...{
                successMessage: 'Success!',
                failureMessage: 'Error!',
            },
            ...options,
        })
        // TODO: possibly auto queue a UST if needed?
        this.startDaemon()
    }

    resetLoading() {
        if (this.loadingState !== LoadingState.loading && !this.daemonRunning) {
            this.loadingState = LoadingState.none
            this.latestMessage = ''
        }
    }

    getAirdrop() {
        const user = (UserContext as any)._currentValue

        this.addOp(async (update) => {
            if (!user.userState) return false

            update({
                title: 'Waiting to generate Airdrop',
                details: 'Synchronizing with blockchain...',
            })

            console.log('before user wait for sync')
            await user.waitForSync()
            console.log('sync complete')

            await user.calculateAllEpks()
            await user.loadSpent()
            update({
                title: 'Creating Airdrop',
                details: 'Generating ZK proof...',
            })

            const { transaction } = await user.getAirdrop()
            update({
                title: 'Creating Airdrop',
                details: 'Waiting for TX inclusion...',
            })

            await this.afterTx(transaction)
        })

        return true
    }

    publishPost(
        title: string = '',
        content: string = '',
        epkNonce: number = 0,
        proveKarma: number = 5
    ) {
        const user = (UserContext as any)._currentValue

        this.addOp(
            async (updateStatus) => {
                updateStatus({
                    title: 'Creating post',
                    details: 'Generating zk proof...',
                })
                const proofData = await user.genRepProof(proveKarma, epkNonce)
                updateStatus({
                    title: 'Creating post',
                    details: 'Waiting for TX inclusion...',
                })
                const { transaction } = await publishPost(
                    proofData,
                    proveKarma,
                    content,
                    title
                )
                await this.afterTx(transaction)
            },
            {
                successMessage: 'Post is finalized',
            }
        )

        return true
    }

    vote(
        postId: string = '',
        commentId: string = '',
        receiver: string,
        epkNonce: number = 0,
        upvote: number = 0,
        downvote: number = 0
    ) {
        if ((upvote === 0 && downvote === 0) || !receiver) return false

        const user = (UserContext as any)._currentValue

        this.addOp(async (updateStatus) => {
            updateStatus({
                title: 'Creating Vote',
                details: 'Generating ZK proof...',
            })
            const proofData = await user.genRepProof(
                upvote + downvote,
                epkNonce
            )
            updateStatus({
                title: 'Creating Vote',
                details: 'Broadcasting vote...',
            })
            const { transaction } = await vote(
                proofData,
                upvote + downvote,
                upvote,
                downvote,
                postId.length > 0 ? postId : commentId,
                receiver,
                postId.length > 0
            )
            updateStatus({
                title: 'Creating Vote',
                details: 'Waiting for transaction...',
            })
            await this.afterTx(transaction)
        })

        return true
    }

    leaveComment(
        content: string,
        postId: string,
        epkNonce: number = 0,
        proveKarma: number = 3
    ) {
        if (!postId || !content) return false

        const user = (UserContext as any)._currentValue

        this.addOp(
            async (updateStatus) => {
                updateStatus({
                    title: 'Creating comment',
                    details: 'Generating ZK proof...',
                })
                const proofData = await user.genRepProof(proveKarma, epkNonce)
                updateStatus({
                    title: 'Creating comment',
                    details: 'Waiting for transaction...',
                })
                const { transaction } = await leaveComment(
                    proofData,
                    proveKarma,
                    content,
                    postId
                )
                await this.afterTx(transaction)
            },
            {
                successMessage: 'Comment is finalized!',
            }
        )

        return true
    }

    async startDaemon() {
        if (this.daemonRunning) return
        this.daemonRunning = true

        for (;;) {
            const op = this.operations.shift()
            this.activeOp = op
            if (op === undefined) break
            const user = (UserContext as any)._currentValue
            try {
                console.log('has things to processed')
                this.loadingState = LoadingState.loading
                await op.fn(
                    (s) =>
                        (this.status = {
                            ...defaultStatus,
                            ...s,
                        })
                )
                console.log('after op')
                this.latestMessage = op.successMessage
                this.loadingState = LoadingState.success
                await user.loadSpent()
            } catch (err) {
                this.loadingState = LoadingState.failed
                this.latestMessage = op.failureMessage
                console.log('Error in queue operation', err)
            }
        }
        this.activeOp = undefined
        this.daemonRunning = false
    }
}

export default createContext(new Queue())
