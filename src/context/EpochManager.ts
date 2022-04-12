import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'

import { DEFAULT_ETH_PROVIDER } from '../config'
import { UnirepFactory } from '@unirep/unirep-social'

import UnirepContext from './Unirep'

const unirepConfig = (UnirepContext as any)._currentValue

export class EpochManager {
    private timer: NodeJS.Timeout | null = null
    private currentEpoch = 0
    readonly nextTransition = 0
    readyToTransition = false

    constructor() {
        makeAutoObservable(this)
        if (typeof window !== 'undefined') {
            this.updateWatch()
        }

        this.load()
    }

    async load() {
        await unirepConfig.loadingPromise
        unirepConfig.unirep.on('EpochEnded', this.loadCurrentEpoch.bind(this))
    }

    async updateWatch() {
        await unirepConfig.loadingPromise
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }
        this.readyToTransition = false
        this.currentEpoch = await unirepConfig.currentEpoch()
        // load the last transition time
        ;(this as any).nextTransition = await this._nextTransition()
        const waitTime = Math.max(this.nextTransition - +new Date(), 0)
        console.log(
            `Next epoch transition in ${waitTime / (60 * 60 * 1000)} hours`
        )
        this.timer = setTimeout(() => {
            this.timer = null
            this.tryTransition()
        }, waitTime) // if it's in the past make wait time 0
        return waitTime
    }

    async loadCurrentEpoch() {
        await unirepConfig.loadingPromise
        const unirepContract = UnirepFactory.connect(
            unirepConfig.unirepAddress,
            DEFAULT_ETH_PROVIDER
        )
        this.currentEpoch = Number(await unirepContract.currentEpoch())
        return this.currentEpoch
    }

    private async _nextTransition() {
        const [lastTransition, epochLength] = await Promise.all([
            unirepConfig.unirep.latestEpochTransitionTime(),
            unirepConfig.unirep.epochLength(),
        ])
        return (lastTransition.toNumber() + epochLength.toNumber()) * 1000
    }

    private async tryTransition() {
        // wait for someone to actually execute the epoch transition
        for (;;) {
            // wait for the epoch change to happen
            const newEpoch = await this.loadCurrentEpoch()
            if (newEpoch > this.currentEpoch) {
                // we're ready to transition,
                this.currentEpoch = newEpoch
                this.readyToTransition = true
                return
            }
            await new Promise((r) => setTimeout(r, 10000))
        }
    }
}

export default createContext(new EpochManager())
