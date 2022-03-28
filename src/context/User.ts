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
import { genUserStateFromContract, genEpochKey } from '@unirep/unirep'
import { formatProofForVerifierContract } from '@unirep/circuits'
import UnirepContext from './Unirep'

export class UserState {
    id?: Identity
    allEpks = [] as string[]
    currentEpoch = 0
    reputation = 0
    spent = 0
    unirepConfig = (UnirepContext as any)._currentValue

    constructor() {
        makeAutoObservable(this)
        this.load()
    }

    // must be called in browser, not in SSR
    async load() {
        const storedUser = window.localStorage.getItem('user')
        if (storedUser && storedUser !== 'null') {
            const { identity } = JSON.parse(storedUser)
            this.id = unSerialiseIdentity(identity)
        }
        await this.unirepConfig.loadingPromise
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
    }

    get currentEpochKeys() {
        return this.allEpks.slice(-3)
    }

    get identity() {
        if (!this.id) return
        return serialiseIdentity(this.id)
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
        if (!this.id) return { posRep: 0, negRep: 0 }
        const { userState } = await this.genUserState()
        const rep = userState.getRepByAttester(
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
        if (!this.id) throw new Error('Identity not loaded')
        await this.unirepConfig.loadingPromise
        const unirepSocial = new ethers.Contract(
            this.unirepConfig.unirepSocialAddress,
            config.UNIREP_SOCIAL_ABI,
            config.DEFAULT_ETH_PROVIDER
        )
        // generate an airdrop proof
        const { userState } = await this.genUserState()
        const attesterId = this.unirepConfig.attesterId
        const { proof, publicSignals } = await userState.genUserSignUpProof(
            BigInt(attesterId)
        )

        const epk = genEpochKey(
            this.id.identityNullifier,
            userState.getUnirepStateCurrentEpoch(),
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
        return { error, transaction, userState }
    }

    async checkInvitationCode(invitationCode: string): Promise<boolean> {
        // check the code first but don't delete it until we signup
        return true
    }

    async signUp(invitationCode: string) {
        if (this.id) {
            throw new Error('Identity already exists!')
        }
        // check the invitation code
        // TODO: integrate this in the signup endpoint
        {
            // const r = await fetch(makeURL(`genInvitationCode/${invitationCode}`))
            // if (!r.ok) {
            //   throw new Error('Invalid invitation code')
            // }
        }

        this.id = genIdentity()
        const commitment = genIdentityCommitment(this.id)
            .toString(16)
            .padStart(64, '0')

        const serializedIdentity = serialiseIdentity(this.id)
        const epk1 = this.getEpochKey(
            0,
            this.id.identityNullifier,
            this.currentEpoch
        )

        // call server user sign up
        const apiURL = makeURL('signup', {
            commitment: commitment,
            epk: epk1,
        })
        const r = await fetch(apiURL)
        const { epoch } = await r.json()
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
}

export default createContext(new UserState())
