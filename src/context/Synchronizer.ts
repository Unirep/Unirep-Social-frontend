import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { ethers } from 'ethers'
import UnirepContext from './Unirep'
import {
  DEFAULT_ETH_PROVIDER
} from '../config'
import { UnirepState, UserState, Attestation } from '@unirep/unirep'
import {
    Circuit,
    formatProofForSnarkjsVerification,
    verifyProof,
} from '@unirep/circuits'
import {
    stringifyBigInts,
    unstringifyBigInts,
} from '@unirep/crypto'

const unirepConfig = (UnirepContext as any)._currentValue

const encodeBigIntArray = (arr: BigInt[]): string => {
    return JSON.stringify(stringifyBigInts(arr))
}

const decodeBigIntArray = (input: string): BigInt[] => {
    return unstringifyBigInts(JSON.parse(input))
}

export class Synchronizer {
  unirepState?: UnirepState
  userState?: UserState
  validProofsByIndex = {} as { [key: number]: any }
  spentProofIndexes = {} as { [key: number]: boolean }

  constructor() {
    makeAutoObservable(this)
    this.load()
  }

  async load() {
    await unirepConfig.loadingPromise
    // now start syncing
      this.unirepState = new UnirepState({
          globalStateTreeDepth: unirepConfig.globalStateTreeDepth,
          userStateTreeDepth: unirepConfig.userStateTreeDepth,
          epochTreeDepth: unirepConfig.epochTreeDepth,
          attestingFee: unirepConfig.attestingFee,
          epochLength: unirepConfig.epochLength,
          numEpochKeyNoncePerEpoch: unirepConfig.numEpochKeyNoncePerEpoch,
          maxReputationBudget: unirepConfig.maxReputationBudget,
      })
  }
    async startDaemon() {
        let latestBlock = await DEFAULT_ETH_PROVIDER.getBlockNumber()
        DEFAULT_ETH_PROVIDER.on('block', (num) => {
            if (num > latestBlock) latestBlock = num
        })
        let latestProcessed = 0
        for (;;) {
            if (latestProcessed === latestBlock) {
                await new Promise((r) => setTimeout(r, 1000))
                continue
            }
            const newLatest = latestBlock
            const allEvents = (
                await Promise.all([
                    unirepConfig.unirepContract.queryFilter(
                        this.unirepFilter,
                        latestProcessed + 1,
                        newLatest
                    ),
                    unirepConfig.unirepSocialContract.queryFilter(
                        this.unirepSocialFilter,
                        latestProcessed + 1,
                        newLatest
                    ),
                ])
            ).flat() as ethers.Event[]
            // first process historical ones then listen
            await this.processEvents(allEvents)
            latestProcessed = newLatest
        }
    }

    get allTopics() {
        const [UserSignedUp] = unirepConfig.unirepContract.filters.UserSignedUp()
            .topics as string[]
        const [UserStateTransitioned] =
            unirepConfig.unirepContract.filters.UserStateTransitioned()
                .topics as string[]
        const [AttestationSubmitted] =
            unirepConfig.unirepContract.filters.AttestationSubmitted()
                .topics as string[]
        const [EpochEnded] = unirepConfig.unirepContract.filters.EpochEnded()
            .topics as string[]
        const [IndexedEpochKeyProof] =
            unirepConfig.unirepContract.filters.IndexedEpochKeyProof()
                .topics as string[]
        const [IndexedReputationProof] =
            unirepConfig.unirepContract.filters.IndexedReputationProof()
                .topics as string[]
        const [IndexedUserSignedUpProof] =
            unirepConfig.unirepContract.filters.IndexedUserSignedUpProof()
                .topics as string[]
        const [IndexedStartedTransitionProof] =
            unirepConfig.unirepContract.filters.IndexedStartedTransitionProof()
                .topics as string[]
        const [IndexedProcessedAttestationsProof] =
            unirepConfig.unirepContract.filters.IndexedProcessedAttestationsProof()
                .topics as string[]
        const [IndexedUserStateTransitionProof] =
            unirepConfig.unirepContract.filters.IndexedUserStateTransitionProof()
                .topics as string[]
        const [_UserSignedUp] = unirepConfig.unirepSocialContract.filters.UserSignedUp()
            .topics as string[]
        const [_PostSubmitted] =
            unirepConfig.unirepSocialContract.filters.PostSubmitted().topics as string[]
        const [_CommentSubmitted] =
            unirepConfig.unirepSocialContract.filters.CommentSubmitted()
                .topics as string[]
        const [_VoteSubmitted] =
            unirepConfig.unirepSocialContract.filters.VoteSubmitted().topics as string[]
        const [_AirdropSubmitted] =
            unirepConfig.unirepSocialContract.filters.AirdropSubmitted()
                .topics as string[]
        return {
            UserSignedUp,
            UserStateTransitioned,
            AttestationSubmitted,
            EpochEnded,
            IndexedEpochKeyProof,
            IndexedReputationProof,
            IndexedUserSignedUpProof,
            IndexedStartedTransitionProof,
            IndexedProcessedAttestationsProof,
            IndexedUserStateTransitionProof,
            _UserSignedUp,
            _PostSubmitted,
            _CommentSubmitted,
            _VoteSubmitted,
            _AirdropSubmitted,
        }
    }

    get unirepFilter() {
        const [UserSignedUp] = unirepConfig.unirepContract.filters.UserSignedUp()
            .topics as string[]
        const [UserStateTransitioned] =
            unirepConfig.unirepContract.filters.UserStateTransitioned()
                .topics as string[]
        const [AttestationSubmitted] =
            unirepConfig.unirepContract.filters.AttestationSubmitted()
                .topics as string[]
        const [EpochEnded] = unirepConfig.unirepContract.filters.EpochEnded()
            .topics as string[]
        const [IndexedEpochKeyProof] =
            unirepConfig.unirepContract.filters.IndexedEpochKeyProof()
                .topics as string[]
        const [IndexedReputationProof] =
            unirepConfig.unirepContract.filters.IndexedReputationProof()
                .topics as string[]
        const [IndexedUserSignedUpProof] =
            unirepConfig.unirepContract.filters.IndexedUserSignedUpProof()
                .topics as string[]
        const [IndexedStartedTransitionProof] =
            unirepConfig.unirepContract.filters.IndexedStartedTransitionProof()
                .topics as string[]
        const [IndexedProcessedAttestationsProof] =
            unirepConfig.unirepContract.filters.IndexedProcessedAttestationsProof()
                .topics as string[]
        const [IndexedUserStateTransitionProof] =
            unirepConfig.unirepContract.filters.IndexedUserStateTransitionProof()
                .topics as string[]

        return {
            address: unirepConfig.unirepContract.address,
            topics: [
                [
                    UserSignedUp,
                    UserStateTransitioned,
                    AttestationSubmitted,
                    EpochEnded,
                    IndexedEpochKeyProof,
                    IndexedReputationProof,
                    IndexedUserSignedUpProof,
                    IndexedStartedTransitionProof,
                    IndexedProcessedAttestationsProof,
                    IndexedUserStateTransitionProof,
                ],
            ],
        }
    }

    get unirepSocialFilter() {
        const [_UserSignedUp] = unirepConfig.unirepSocialContract.filters.UserSignedUp()
            .topics as string[]
        const [_PostSubmitted] =
            unirepConfig.unirepSocialContract.filters.PostSubmitted().topics as string[]
        const [_CommentSubmitted] =
            unirepConfig.unirepSocialContract.filters.CommentSubmitted()
                .topics as string[]
        const [_VoteSubmitted] =
            unirepConfig.unirepSocialContract.filters.VoteSubmitted().topics as string[]
        const [_AirdropSubmitted] =
            unirepConfig.unirepSocialContract.filters.AirdropSubmitted()
                .topics as string[]
        // Unirep Social events
        return {
            address: unirepConfig.unirepSocialContract.address,
            topics: [
                [
                    _UserSignedUp,
                    _PostSubmitted,
                    _CommentSubmitted,
                    _VoteSubmitted,
                    _AirdropSubmitted,
                ],
            ],
        }
    }

    async processEvents(_events: ethers.Event | ethers.Event[]) {
        const events = [_events].flat()
        if (events.length === 0) return
        events.sort((a: any, b: any) => {
            if (a.blockNumber !== b.blockNumber) {
                return a.blockNumber - b.blockNumber
            }
            if (a.transactionIndex !== b.transactionIndex) {
                return a.transactionIndex - b.transactionIndex
            }
            return a.logIndex - b.logIndex
        })

        for (const event of events) {
          await this._processEvent(event)
        }
    }

    private async _processEvent(event: any) {
        // no, i don't know what a switch statement is...
        if (event.topics[0] === this.allTopics.IndexedEpochKeyProof) {
            console.log('IndexedEpochKeyProof')
            const _proofIndex = Number(event.topics[1])
            const _epoch = Number(event.topics[2])
            const decodedData = unirepConfig.unirepContract.interface.decodeEventLog(
                'IndexedEpochKeyProof',
                event.data
            )
            if (!decodedData) {
                throw new Error('Failed to decode data')
            }
            const args = decodedData._proof

            const formatPublicSignals = []
                .concat(args.globalStateTree, args.epoch, args.epochKey)
                .map((n) => BigInt(n))
            const formattedProof = args.proof.map((n: any) => BigInt(n))
            // const proof = encodeBigIntArray(formattedProof)
            // const publicSignals = encodeBigIntArray(formatPublicSignals)
            const isValid = await verifyProof(
                Circuit.verifyEpochKey,
                formatProofForSnarkjsVerification(formattedProof),
                formatPublicSignals
            )
            const isGSTRootExisted = this.unirepState?.GSTRootExists(
                args.globalStateTree,
                _epoch
            )
            if (isValid && isGSTRootExisted) {
              this.validProofsByIndex[_proofIndex] = { args, _epoch }
            }
        } else if (event.topics[0] === this.allTopics.IndexedReputationProof) {
            console.log('IndexedReputationProof')
            const _proofIndex = Number(event.topics[1])
            const _epoch = Number(event.topics[2])
            const decodedData = unirepConfig.unirepContract.interface.decodeEventLog(
                'IndexedReputationProof',
                event.data
            )
            if (!decodedData) {
                throw new Error('Failed to decode data')
            }
            const args = decodedData._proof
            const formatPublicSignals = []
                .concat(
                    args.repNullifiers,
                    args.epoch,
                    args.epochKey,
                    args.globalStateTree,
                    args.attesterId,
                    args.proveReputationAmount,
                    args.minRep,
                    args.proveGraffiti,
                    args.graffitiPreImage
                )
                .map((n) => BigInt(n))
            const formattedProof = args.proof.map((n: any) => BigInt(n))
            const isValid = await verifyProof(
                Circuit.proveReputation,
                formatProofForSnarkjsVerification(formattedProof),
                formatPublicSignals
            )
            const isGSTRootExisted = this.unirepState?.GSTRootExists(
                args.globalStateTree,
                _epoch
            )
            let validNullifiers = true
            const nullifiers = args.repNullifiers.map((n: any) => BigInt(n))
            const nullifiersAmount = Number(args.proveReputationAmount)
            for (let j = 0; j < nullifiersAmount; j++) {
                if (this.unirepState?.nullifierExist(nullifiers[j])) {
                    console.log('duplicated nullifier', BigInt(nullifiers[j]).toString())
                    validNullifiers = false
                    break
                }
            }

            if (validNullifiers) {
                for (let j = 0; j < nullifiersAmount; j++) {
                    this.unirepState?.addReputationNullifiers(nullifiers[j], event.blockNumber)
                }
            }
            if (isValid && isGSTRootExisted && validNullifiers) {
              this.validProofsByIndex[_proofIndex] = { args, _epoch, isReputation: true }
            }
        } else if (
            event.topics[0] === this.allTopics.IndexedUserSignedUpProof
        ) {
            console.log('IndexedUserSignedUpProof')
            const _proofIndex = Number(event.topics[1])
            const _epoch = Number(event.topics[2])
            const decodedData = unirepConfig.unirepContract.interface.decodeEventLog(
                'IndexedUserSignedUpProof',
                event.data
            )
            if (!decodedData) {
                throw new Error('Failed to decode data')
            }
            const args = decodedData._proof

            const formatPublicSignals = []
                .concat(
                    args.epoch,
                    args.epochKey,
                    args.globalStateTree,
                    args.attesterId,
                    args.userHasSignedUp
                )
                .map((n) => BigInt(n))
            const formattedProof = args.proof.map((n: any) => BigInt(n))
            const isValid = await verifyProof(
                Circuit.proveUserSignUp,
                formatProofForSnarkjsVerification(formattedProof),
                formatPublicSignals
            )
            const isGSTRootExisted = this.unirepState?.GSTRootExists(
                args.globalStateTree,
                _epoch
            )
            if (isValid && isGSTRootExisted) {
              this.validProofsByIndex[_proofIndex] = { args, _epoch }
            }
        } else if (
            event.topics[0] === this.allTopics.IndexedStartedTransitionProof
        ) {
            console.log('IndexedStartedTransitionProof')
            const _proofIndex = Number(event.topics[1])
            const _blindedUserState = BigInt(event.topics[2])
            const _globalStateTree = BigInt(event.topics[3])
            const decodedData = unirepConfig.unirepContract.interface.decodeEventLog(
                'IndexedStartedTransitionProof',
                event.data
            )
            if (!decodedData) {
                throw new Error('Failed to decode data')
            }
            const _blindedHashChain = BigInt(decodedData._blindedHashChain)
            const formatPublicSignals = [
                _blindedUserState,
                _blindedHashChain,
                _globalStateTree,
            ]
            const formattedProof = decodedData._proof.map((n: any) => BigInt(n))
            const isValid = await verifyProof(
                Circuit.startTransition,
                formatProofForSnarkjsVerification(formattedProof),
                formatPublicSignals
            )
            if (isValid) {
              this.validProofsByIndex[_proofIndex] = {}
            }
        } else if (
            event.topics[0] === this.allTopics.IndexedProcessedAttestationsProof
        ) {
            console.log('IndexedProcessedAttestationsProof')
            // await this.processAttestationProofEvent(event)
            const _proofIndex = Number(event.topics[1])
            const _inputBlindedUserState = BigInt(event.topics[2])
            const decodedData = unirepConfig.unirepContract.interface.decodeEventLog(
                'IndexedProcessedAttestationsProof',
                event.data
            )
            if (!decodedData) {
                throw new Error('Failed to decode data')
            }
            const _outputBlindedUserState = BigInt(
                decodedData._outputBlindedUserState
            )
            const _outputBlindedHashChain = BigInt(
                decodedData._outputBlindedHashChain
            )

            const formatPublicSignals = [
                _outputBlindedUserState,
                _outputBlindedHashChain,
                _inputBlindedUserState,
            ]
            const formattedProof = decodedData._proof.map((n: any) => BigInt(n))
            const isValid = await verifyProof(
                Circuit.processAttestations,
                formatProofForSnarkjsVerification(formattedProof),
                formatPublicSignals
            )
            // verify the GST root when it's used in a transition
            if (isValid) {
              this.validProofsByIndex[_proofIndex] = { }
            }
        } else if (
            event.topics[0] === this.allTopics.IndexedUserStateTransitionProof
        ) {
            console.log('IndexedUserStateTransitionProof')
            const _proofIndex = Number(event.topics[1])
            const decodedData = unirepConfig.unirepContract.interface.decodeEventLog(
                'IndexedUserStateTransitionProof',
                event.data
            )
            if (!decodedData) {
                throw new Error('Failed to decode data')
            }
            const args = decodedData._proof
            const proofIndexRecords = decodedData._proofIndexRecords.map((n: any) =>
                Number(n)
            )

            const formatPublicSignals = []
                .concat(
                    args.newGlobalStateTreeLeaf,
                    args.epkNullifiers,
                    args.transitionFromEpoch,
                    args.blindedUserStates,
                    args.fromGlobalStateTree,
                    args.blindedHashChains,
                    args.fromEpochTree
                )
                .map((n) => BigInt(n))
            const formattedProof = args.proof.map((n: any) => BigInt(n))
            const proof = encodeBigIntArray(formattedProof)
            const publicSignals = encodeBigIntArray(formatPublicSignals)
            const isValid = await verifyProof(
                Circuit.userStateTransition,
                formatProofForSnarkjsVerification(formattedProof),
                formatPublicSignals
            )
            if (isValid) {
              this.validProofsByIndex[_proofIndex] = {}
            }
        } else if (event.topics[0] === this.allTopics.UserSignedUp) {
            const decodedData = unirepConfig.unirepContract.interface.decodeEventLog(
                'UserSignedUp',
                event.data
            )
            const epoch = Number(event.topics[1])
            const idCommitment = BigInt(event.topics[2])
            const attesterId = Number(decodedData._attesterId)
            const airdrop = Number(decodedData._airdropAmount)
            await this.unirepState?.signUp(
              epoch,
              idCommitment,
              attesterId,
              airdrop,
              event.blockNumber
            )
        } else if (event.topics[0] === this.allTopics.UserStateTransitioned) {
            console.log('UserStateTransitioned')
            await this.USTEvent(event)
        } else if (event.topics[0] === this.allTopics.AttestationSubmitted) {
            console.log('AttestationSubmitted')
            const _epoch = Number(event.topics[1])
            const _epochKey = BigInt(event.topics[2])
            const _attester = event.topics[3]
            const decodedData = unirepConfig.unirepContract.interface.decodeEventLog(
                'AttestationSubmitted',
                event.data
            )
            const toProofIndex = Number(decodedData.toProofIndex)
            const fromProofIndex = Number(decodedData.fromProofIndex)
            const attestIndex = Number(decodedData.attestIndex)
            if (!this.validProofsByIndex[toProofIndex]) return
            const attestationProof = this.validProofsByIndex[toProofIndex]
            if (fromProofIndex) {
              if (!this.validProofsByIndex[fromProofIndex]) return
              const proof = this.validProofsByIndex[fromProofIndex]
              if (!proof.isReputation) return
              const proveReputationAmount = Number(proof.args._proof.proveReputationAmount)
              if (!attestationProof) return console.log('No to proof')
              const repInAttestation = Number(attestationProof.args.posRep) + Number(attestationProof.args.negRep)
              if (proveReputationAmount < repInAttestation) return console.log('not enough rep')
            }
            //
            if (fromProofIndex && this.spentProofIndexes[fromProofIndex]) return
            if (fromProofIndex) this.spentProofIndexes[fromProofIndex] = true
            const attestation = new Attestation(
                BigInt(attestationProof.args.attesterId),
                BigInt(attestationProof.args.posRep),
                BigInt(attestationProof.args.negRep),
                BigInt(attestationProof.args.graffiti),
                BigInt(attestationProof.args.signUp)
            )
            if (_epochKey !== attestationProof.args.epochKey) return console.log('epoch key mismatch')
            if (this.unirepState?.isEpochKeySealed(_epochKey.toString())) return console.log('epoch key sealed')
            this.unirepState?.addAttestation(_epochKey.toString(), attestation, event.blockNumber)
        } else if (event.topics[0] === this.allTopics.EpochEnded) {
            console.log('EpochEnded')
            const epoch = Number(event.topics[1])
            await this.unirepState?.epochTransition(epoch, event.blockNumber)
        } else {
            console.log(event)
            throw new Error(`Unrecognized event topic "${event.topics[0]}"`)
        }
    }
}

export default createContext(new Synchronizer())
