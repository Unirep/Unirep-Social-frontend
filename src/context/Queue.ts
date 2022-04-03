import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { makeURL } from '../utils'
import { DEFAULT_ETH_PROVIDER } from '../config'

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

interface Operation {
    fn: () => void | Promise<void>
    successMessage: string
    failureMessage: string
    type?: ActionType
}

class Queue {
    operations = [] as Operation[]
    loadingState = LoadingState.none
    latestMessage = ''
    daemonRunning = false

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

    addOp(operation: () => void | Promise<void>, options = {}) {
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
            if (op === undefined) break
            try {
                this.loadingState = LoadingState.loading
                await op.fn()
                this.latestMessage = op.successMessage
                this.loadingState = LoadingState.success
            } catch (err) {
                this.loadingState = LoadingState.failed
                this.latestMessage = op.failureMessage
                console.log('Error in queue operation', err)
            }
        }
        this.daemonRunning = false
    }
}

export default createContext(new Queue())
