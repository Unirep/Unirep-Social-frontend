import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'

export enum LoadingState {
    loading,
    success,
    failed,
    none,
}

interface Operation {
    fn: () => void | Promise<void>
    successMessage: string
    failureMessage: string
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
