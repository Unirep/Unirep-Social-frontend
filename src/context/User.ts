import { createContext } from 'react'
import { makeObservable, observable, computed } from 'mobx'
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
import { genEpochKey } from '@unirep/unirep'
import { UnirepState, UserState } from '../overrides/unirep'
import {
    formatProofForVerifierContract,
    formatProofForSnarkjsVerification,
    verifyProof,
} from '@unirep/circuits'
import UnirepContext from './Unirep'
import { Synchronizer } from './Synchronizer'

export class User extends Synchronizer {
    id?: Identity
    allEpks = [] as string[]
    currentEpoch = 0
    reputation = 30
    unirepConfig = (UnirepContext as any)._currentValue
    spent = 0

    constructor() {
        super()
        makeObservable(this, {
            currentEpoch: observable,
            reputation: observable,
            spent: observable,
            unirepState: observable,
            userState: observable,
            currentEpochKeys: computed,
            allEpks: observable,
            syncPercent: computed,
            startBlock: observable,
            latestBlock: observable,
            latestProcessedBlock: observable,
        })
        if (typeof window !== 'undefined') {
            this.load()
        }
    }

    get netReputation() {
        return this.reputation - this.spent
    }

    get isSynced() {
        return this.currentEpoch === this.unirepState?.currentEpoch
    }

    // must be called in browser, not in SSR
    async load() {
        await super.load() // loads the unirep state
        if (!this.unirepState) throw new Error('Unirep state not initialized')
        const storedState = window.localStorage.getItem('user.state')
        if (storedState) {
            const data = JSON.parse(storedState)
            const id = unSerialiseIdentity(data.id)
            const userState = UserState.fromJSON(data.id, data.userState)
            Object.assign(this, {
                ...data,
                id,
                userState,
                unirepState: userState.getUnirepState(),
            })
            await this.calculateAllEpks()
        }
        if (this.id) {
            this.startDaemon()
            this.waitForSync().then(() => {
                this.loadReputation()
                this.save()
            })
        }
        await this.unirepConfig.loadingPromise

        await this.loadReputation()
        // start listening for new epochs
        this.unirepConfig.unirep.on(
            'EpochEnded',
            this.loadCurrentEpoch.bind(this)
        )
        await this.loadCurrentEpoch()
    }

    save() {
        super.save()
        // save user state
        const data = {
            userState: this.userState,
            id: this.identity,
            currentEpoch: this.currentEpoch,
            spent: this.spent,
        }
        if (typeof this.userState?.toJSON(0) === 'string') {
            throw new Error('Invalid user state toJSON return value')
        }
        window.localStorage.setItem('user.state', JSON.stringify(data))
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
        return this.allEpks.slice(
            -1 * this.unirepConfig.numEpochKeyNoncePerEpoch
        )
    }

    get identity() {
        if (!this.id) return undefined
        const serializedIdentity = serialiseIdentity(this.id)
        return serializedIdentity
    }

    get needsUST() {
        if (!this.userState) return false
        return this.currentEpoch > this.userState.latestTransitionedEpoch
    }

    setIdentity(identity: string | Identity) {
        if (this.userState) {
            throw new Error('Identity already set, change is not supported')
        }
        if (!this.unirepState) {
            throw new Error('Unirep state is not initialized')
        }
        if (typeof identity === 'string') {
            this.id = unSerialiseIdentity(identity)
        } else {
            this.id = identity
        }
        this.userState = new UserState(this.unirepState, this.id)
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
                )
                    .toString(16)
                    .padStart(8, '0')
                epks.push(tmp)
            }
            return epks
        }
        this.allEpks = [] as string[]
        for (let x = 1; x <= this.currentEpoch; x++) {
            this.allEpks.push(...getEpochKeys(x))
        }
    }

    private getEpochKey(epkNonce: number, identityNullifier: any, epoch: number) {
        const epochKey = genEpochKey(
            identityNullifier,
            epoch,
            epkNonce,
            this.unirepConfig.epochTreeDepth
        )
        return epochKey.toString(16)
    }

    async loadReputation() {
        if (!this.id || !this.userState) return { posRep: 0, negRep: 0 }
    
        const rep = this.userState.getRepByAttester(
            BigInt(this.unirepConfig.attesterId)
        )
        this.reputation = Number(rep.posRep) - Number(rep.negRep)
        return rep
    }

    private async loadSpent() {
        const paramStr = this.allEpks.join('_')
        const apiURL = makeURL(`records/${paramStr}`, { spentonly: true })

        const r = await fetch(apiURL)
        const data = await r.json()
        this.spent = data.reduce((acc: number, v: any) => {
            return acc + v.spent
        }, 0)
    }

    private async updateUser(currentEpoch: number) {
        if (this.id) {
            // write user to localStorage
            await this.calculateAllEpks()
            await this.loadReputation()

            window.localStorage.setItem(
                'user',
                JSON.stringify({
                    identity: serialiseIdentity(this.id),
                    epoch_keys: this.allEpks[-3],
                    all_epoch_keys: this.allEpks,
                    reputation: this.reputation,
                    current_epoch: currentEpoch,
                    isConfirmed: true,
                    spent: 0,
                    userState: '{}', // userStateResult.userState.toJSON(),
                })
            )
        }
    }

    async genProof(amount: number, min: number, epkNonce: number) {
        if (epkNonce >= this.unirepConfig.numEpochKeyNoncePerEpoch) {
            throw new Error('Invalid epk nonce')
        }
        const currentEpoch = await this.loadCurrentEpoch()
        const epk = this.getEpochKey(
            epkNonce,
            this.id?.identityNullifier,
            currentEpoch
        )
        const rep = await this.loadReputation()
        if (this.spent === -1) {
            throw new Error('All nullifiers are spent')
        }
        if (this.spent + amount > Number(rep.posRep) - Number(rep.negRep)) {
            throw new Error('Not enough reputation')
        }
        const nonceList = [] as BigInt[]
        for (let i = 0; i < amount; i++) {
            nonceList.push(BigInt(this.spent + i))
        }
        // console.log(nonceList)
        // console.log(this.unirepConfig.maxReputationBudget)
        for (let i = amount; i < this.unirepConfig.maxReputationBudget; i++) {
            nonceList.push(BigInt(-1))
        }
        const proveGraffiti = BigInt(0)
        const graffitiPreImage = BigInt(0)
        if (!this.userState) throw new Error('User state not initialized')
        const results = await this.userState.genProveReputationProof(
            BigInt(this.unirepConfig.attesterId),
            epkNonce,
            min,
            proveGraffiti,
            graffitiPreImage,
            nonceList
        )

        const proof = formatProofForVerifierContract(results.proof)
        const publicSignals = results.publicSignals
        this.spent += amount
        this.save()
        return { epk, proof, publicSignals, currentEpoch }
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
        const { blockNumber } =
            await config.DEFAULT_ETH_PROVIDER.waitForTransaction(transaction)
        await this.waitForSync(blockNumber)
        await this.loadReputation()
        return { error, transaction }
    }

    async checkInvitationCode(invitationCode: string): Promise<boolean> {
        // check the code first but don't delete it until we signup --> related to backend
        const apiURL = makeURL(`genInvitationCode/${invitationCode}`, {})
        const r = await fetch(apiURL)
        if (!r.ok) return false
        return r.json()
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
        this.startDaemon()
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
            invitationCode,
        })
        const r = await fetch(apiURL)
        const { epoch, transaction } = await r.json()
        await config.DEFAULT_ETH_PROVIDER.waitForTransaction(transaction)
        return {
            i: serializedIdentity,
            c: commitment,
            epoch,
        }

        // return await this.updateUser(epoch)
    }

    // async login() {
    //     console.log('login, get user state')
    //     const userStateResult = await this.genUserState()
    //     const userEpoch = userStateResult.userState.latestTransitionedEpoch
    //     let userState: any = userStateResult.userState

    //     if (userEpoch !== userStateResult.currentEpoch) {
    //         console.log(
    //             'user epoch is not the same as current epoch, do user state transition, ' +
    //                 userEpoch +
    //                 ' != ' +
    //                 userStateResult.currentEpoch
    //         )
    //         await this.userStateTransition()
    //         const retAfterUST = await this.genUserState()

    //         userState = retAfterUST.userState
    //     }

    //     // no matter is same epoch or not, try get airdrop
    //     try {
    //         console.log('get airdrop')
    //         await this.getAirdrop()
    //     } catch (e) {
    //         console.log('airdrop error: ', e)
    //     }

    //     await this.loadCurrentEpoch()
    //     await this.calculateAllEpks()
    //     await this.loadReputation()
    //     await this.loadSpent()

    //     if (this.id) {
    //         window.localStorage.setItem(
    //             'user',
    //             JSON.stringify({
    //                 identity: serialiseIdentity(this.id),
    //                 epoch_keys: this.currentEpochKeys,
    //                 all_epoch_keys: this.allEpks,
    //                 reputation: this.reputation,
    //                 current_epoch: userStateResult.currentEpoch,
    //                 isConfirmed: true,
    //                 spent: this.spent,
    //                 userState: userState.toJSON(),
    //             })
    //         )
    //     }
    // }

    // logout() {
    //     console.log('log out')
    //     this.id = undefined
    //     this.allEpks = [] as string[]
    //     this.currentEpoch = 0
    //     this.reputation = 0
    //     this.spent = 0

    //     window.localStorage.setItem('user', 'null')
    // }

    async genRepProof(amount: number, min: number, epkNonce: number) {
        if (epkNonce >= this.unirepConfig.numEpochKeyNoncePerEpoch) {
            throw new Error('Invalid epk nonce')
        }
        const currentEpoch = await this.loadCurrentEpoch()
        const epk = this.getEpochKey(
            epkNonce,
            this.id?.identityNullifier,
            this.currentEpoch
        )
        const rep = await this.loadReputation()
        if (this.spent === -1) {
            throw new Error('All nullifiers are spent')
        }
        if (this.spent + amount > Number(rep.posRep) - Number(rep.negRep)) {
            throw new Error('Not enough reputation')
        }
        const nonceList = [] as BigInt[]
        for (let i = 0; i < amount; i++) {
            nonceList.push(BigInt(this.spent + i))
        }
        // console.log(nonceList)
        // console.log(this.unirepConfig.maxReputationBudget)
        for (let i = amount; i < this.unirepConfig.maxReputationBudget; i++) {
            nonceList.push(BigInt(-1))
        }
        const proveGraffiti = BigInt(0)
        const graffitiPreImage = BigInt(0)
        if (!this.userState) throw new Error('User state not initialized')
        const results = await this.userState.genProveReputationProof(
            BigInt(this.unirepConfig.attesterId),
            epkNonce,
            min,
            proveGraffiti,
            graffitiPreImage,
            nonceList
        )

        const proof = formatProofForVerifierContract(results.proof)
        const publicSignals = results.publicSignals
        this.spent += amount
        this.save()
        return { epk, proof, publicSignals, currentEpoch }
    }

    async userStateTransition() {
        if (!this.userState) {
            throw new Error('User state not initialized')
        }
        const results = await this.userState.genUserStateTransitionProofs()
        const r = await fetch(makeURL('userStateTransition'), {
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                results,
                fromEpoch: this.userState.latestTransitionedEpoch,
            }),
            method: 'POST',
        })
        const { transaction, error } = await r.json()

        if (error && error.length > 0) {
            console.log(error)
        } else {
            await this.loadCurrentEpoch()
            await this.calculateAllEpks()
            await this.loadReputation()
            this.spent = 0
        } // store user state in local storage

        return { error, transaction }
    }

    // async attestationSubmitted(event: any) {
    //     await super.attestationSubmitted(event)
    //     const _epoch = Number(event.topics[1])
    //     const _epochKey = ethers.BigNumber.from(event.topics[2])
    //     const _attester = event.topics[3]
    //     const decodedData = this.unirepConfig.unirep.interface.decodeEventLog(
    //         'AttestationSubmitted',
    //         event.data
    //     )
    //     const toProofIndex = Number(decodedData.toProofIndex)
    //     const fromProofIndex = Number(decodedData.fromProofIndex)
    //     if (!this.validProofs[this.proofKey(_epoch, toProofIndex)])
    //         return
    //   console.log('t2')
    //     const attestationProof =
    //         this.validProofs[this.proofKey(_epoch, toProofIndex)]
    //     if (
    //         fromProofIndex &&
    //         this.spentProofs[this.proofKey(_epoch, fromProofIndex)]
    //     )
    //         return
    //   console.log('t3')
    //     if (!_epochKey.eq('0x' + attestationProof.epochKey))
    //         return
    //     if (this.unirepState?.isEpochKeySealed(_epochKey.toString()))
    //         return
    //   console.log('t4')
    //   console.log(fromProofIndex)
    //     if (fromProofIndex) {
    //   console.log('t6')
    //         if (!this.validProofs[this.proofKey(_epoch, fromProofIndex)]) return
    //         const proof =
    //             this.validProofs[this.proofKey(_epoch, fromProofIndex)]
    //   console.log('t5')
    //         if (!proof.isReputation) return
    //         const proveReputationAmount = Number(
    //             proof.proof.proveReputationAmount
    //         )
    //   console.log('t7')
    //         if (!attestationProof) return
    //         if (
    //             proveReputationAmount !==
    //             Number(decodedData._attestation.posRep) +
    //                 Number(decodedData._attestation.negRep)
    //         )
    //             return
    //             console.log('updating spent')
    //         if (this.currentEpochKeys.indexOf(attestationProof.epochKey.padStart(8, '0')) !== -1) {
    //           // otherwise add the spent value
    //           this.spent += proveReputationAmount
    //         }
    //     }
    // }

    async epochEnded(event: any) {
        await super.epochEnded(event)
        await this.loadReputation()
        // await this.loadCurrentEpoch()
        // this.spent = 0
    }
}

export default createContext(new User())
