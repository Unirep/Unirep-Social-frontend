import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import * as config from '../config'
import { ethers } from 'ethers'
import {
    genIdentity,
    genIdentityCommitment,
    serialiseIdentity,
    unSerialiseIdentity,
    Identity,
} from '@unirep/crypto'
import { UnirepFactory } from '@unirep/unirep-social'
import { makeURL } from '../utils'
import {
    genUserStateFromContract,
    genEpochKey,
    UserState,
} from '@unirep/unirep'
import { formatProofForVerifierContract } from '@unirep/circuits'
import UnirepContext from './Unirep'
import { Synchronizer } from './Synchronizer'

export class User extends Synchronizer {
    id?: Identity
    allEpks = [] as string[]
    currentEpoch = 0
    reputation = 0
    spent = 0
    unirepConfig = (UnirepContext as any)._currentValue

    constructor() {
        super()
        this.load()
    }

    // must be called in browser, not in SSR
    async load() {
        await super.load() // loads the unirep state
        if (!this.unirepState) throw new Error('Unirep state not initialized')
        const storedUser = window.localStorage.getItem('user')
        if (storedUser && storedUser !== 'null') {
            const { identity } = JSON.parse(storedUser)
            this.id = unSerialiseIdentity(identity)
            this.userState = new UserState(this.unirepState, this.id)
            this.startDaemon()
        }
        await this.loadReputation()
        // start listening for new epochs
        const unirep = new ethers.Contract(
            this.unirepConfig.unirepAddress,
            config.UNIREP_ABI,
            config.DEFAULT_ETH_PROVIDER
        )
        unirep.on('EpochEnded', this.loadCurrentEpoch.bind(this))
        await this.loadCurrentEpoch()
    }

    async loadCurrentEpoch() {
        await this.unirepConfig.loadingPromise
        const unirepContract = UnirepFactory.connect(
            this.unirepConfig.unirepAddress,
            config.DEFAULT_ETH_PROVIDER
        )
        this.currentEpoch = Number(await unirepContract.currentEpoch())
        return this.currentEpoch
    }

    get currentEpochKeys() {
        return this.allEpks.slice(-3)
    }

    get identity() {
        if (!this.id) return
        return serialiseIdentity(this.id)
    }

    setIdentity(identity: string | Identity) {
        if (typeof identity === 'string') {
            this.id = unSerialiseIdentity(identity)
        } else {
            this.id = identity
        }
        if (this.userState) {
            throw new Error('Identity already set, change is not supported')
        }
        if (!this.unirepState) {
            throw new Error('Unirep state is not initialized')
        }
        this.userState = new UserState(this.unirepState, this.id)
        this.startDaemon()
    }

    async calculateAllEpks() {
        if (!this.id) throw new Error('No identity loaded')
        await this.unirepConfig.loadingPromise
        const { identityNullifier } = this.id
        const getEpochKeys = (epoch: number) => {
            const epks: string[] = []
            for (
                let i = 0;
                i < this.unirepConfig.numEpochKeyNoncePerEpoch;
                i++
            ) {
                const tmp = genEpochKey(
                    identityNullifier,
                    epoch,
                    i,
                    this.unirepConfig.epochTreeDepth
                ).toString(16)
                epks.push(tmp)
            }
            return epks
        }
        this.allEpks = [] as string[]
        for (let x = 0; x < this.currentEpoch; x++) {
            this.allEpks.push(...getEpochKeys(x))
        }
    }

    async loadReputation() {
        if (!this.id || !this.userState) return { posRep: 0, negRep: 0 }
        const rep = this.userState.getRepByAttester(
            BigInt(this.unirepConfig.attesterId)
        )
        this.reputation = Number(rep.posRep) - Number(rep.negRep)
        return rep
    }

    async genUserState() {
        await this.unirepConfig.loadingPromise
        const startTime = new Date().getTime()
        const unirepContract = UnirepFactory.connect(
            this.unirepConfig.unirepAddress,
            config.DEFAULT_ETH_PROVIDER
        )
        const parsedUserState = undefined
        console.log('update user state from stored us')
        const userState = await genUserStateFromContract(
            config.DEFAULT_ETH_PROVIDER,
            unirepContract.address,
            this.id,
            parsedUserState
        )
        const endTime = new Date().getTime()
        console.log(
            `Gen us time: ${endTime - startTime} ms (${Math.floor(
                (endTime - startTime) / 1000
            )} s)`
        )
        const numEpochKeyNoncePerEpoch =
            this.unirepConfig.numEpochKeyNoncePerEpoch
        const attesterId = this.unirepConfig.attesterId
        const jsonedUserState = JSON.parse(userState.toJSON())
        const currentEpoch = userState.getUnirepStateCurrentEpoch()

        return {
            userState,
            numEpochKeyNoncePerEpoch,
            currentEpoch: Number(currentEpoch),
            attesterId,
            hasSignedUp: jsonedUserState.hasSignedUp,
        }
    }

    async getAirdrop() {
        if (!this.id || !this.userState) throw new Error('Identity not loaded')
        await this.unirepConfig.loadingPromise
        const unirepSocial = new ethers.Contract(
            this.unirepConfig.unirepSocialAddress,
            config.UNIREP_SOCIAL_ABI,
            config.DEFAULT_ETH_PROVIDER
        )
        // generate an airdrop proof
        const attesterId = this.unirepConfig.attesterId
        const { proof, publicSignals } =
            await this.userState.genUserSignUpProof(BigInt(attesterId))

        const epk = genEpochKey(
            this.id.identityNullifier,
            this.userState.getUnirepStateCurrentEpoch(),
            0
        )
        const gotAirdrop = await unirepSocial.isEpochKeyGotAirdrop(epk)
        if (gotAirdrop) return { error: 'The epoch key has been airdropped.' }

        const apiURL = makeURL('airdrop', {})
        const r = await fetch(apiURL, {
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                proof: formatProofForVerifierContract(proof),
                publicSignals,
            }),
            method: 'POST',
        })
        const { error, transaction } = await r.json()
        return { error, transaction }
    }

    async checkInvitationCode(invitationCode: string): Promise<boolean> {
        // check the code first but don't delete it until we signup
        return true
    }

    async hasSignedUp(identity: string) {
        const unirepConfig = (UnirepContext as any)._currentValue
        await unirepConfig.loadingPromise
        const id = unSerialiseIdentity(identity)
        const commitment = genIdentityCommitment(id)
        return unirepConfig.unirep.hasUserSignedUp(commitment)
    }

    async signUp(invitationCode: string) {
        if (this.id) {
            throw new Error('Identity already exists!')
        }
        const unirepConfig = (UnirepContext as any)._currentValue
        await unirepConfig.loadingPromise
        // check the invitation code
        // TODO: integrate this in the signup endpoint
        {
            // const r = await fetch(makeURL(`genInvitationCode/${invitationCode}`))
            // if (!r.ok) {
            //   throw new Error('Invalid invitation code')
            // }
        }

        const id = genIdentity()
        this.setIdentity(id)
        if (!this.id) throw new Error('Iden is not set')
        const commitment = genIdentityCommitment(this.id)
            .toString(16)
            .padStart(64, '0')

        const serializedIdentity = serialiseIdentity(this.id)
        const epk1 = this.getEpochKey(
            0,
            (this.id as any).identityNullifier,
            this.currentEpoch
        )

        // call server user sign up
        const apiURL = makeURL('signup', {
            commitment: commitment,
            epk: epk1,
        })
        const r = await fetch(apiURL)
        const { epoch, transaction } = await r.json()
        const receipt = await config.DEFAULT_ETH_PROVIDER.waitForTransaction(
            transaction
        )
        console.log('test', receipt)
        return {
            i: serializedIdentity,
            c: commitment,
            epoch,
        }
    }

    getEpochKey(epkNonce: number, identityNullifier: any, epoch: number) {
        const epochKey = genEpochKey(
            identityNullifier,
            epoch,
            epkNonce,
            this.unirepConfig.epochTreeDepth
        )
        return epochKey.toString(16)
    }

    async userStateTransition() {
        if (!this.userState) {
            throw new Error('User state not initialized')
        }
        const results = await this.userState.genUserStateTransitionProofs()
        const r = await fetch(makeURL('userStateTransition'), {
            headers: {
                'content-type': 'application/json',
                body: JSON.stringify({
                    results,
                    fromEpoch: this.userState.latestTransitionedEpoch,
                }),
                method: 'POST',
            },
        })
        const { transaction, error } = await r.json()
        return { error, transaction }
    }
}

export default createContext(new User())
