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

export class Queue {
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

    async startDaemon() {
        if (this.daemonRunning) return
        this.daemonRunning = true

        for (;;) {
            const op = this.operations.shift()
            this.activeOp = op
            if (op === undefined) break
            const user = (UserContext as any)._currentValue
            try {
                this.loadingState = LoadingState.loading
                await op.fn(
                    (s) =>
                        (this.status = {
                            ...defaultStatus,
                            ...s,
                        })
                )
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
