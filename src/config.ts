import { ethers } from 'ethers'

const identityPrefix = 'Unirep.identity.'
const identityCommitmentPrefix = 'Unirep.identityCommitment.'
const epkProofPrefix = 'Unirep.epk.proof.'
const epkPublicSignalsPrefix = 'Unirep.epk.publicSignals.'
const reputationProofPrefix = 'Unirep.reputation.proof.'
const reputationPublicSignalsPrefix = 'Unirep.reputation.publicSignals.'
const signUpProofPrefix = 'Unirep.signUp.proof.'
const signUpPublicSignalsPrefix = 'Unirep.signUp.publicSignals.'

const SERVER = 'http://localhost:3001'
const DEFAULT_ETH_PROVIDER = 'http://localhost:8545'
const DEFAULT_START_BLOCK = 0
const DEFAULT_MAX_EPOCH_KEY_NONCE = 2
const DEFAULT_NUM_ATTESTATIONS_PER_EPOCH_KEY = 6
const DEFAULT_EPOCH_LENGTH = 30
const DEFAULT_ATTESTING_FEE = ethers.utils.parseEther("0.01")
const DEFAULT_TREE_DEPTHS_CONFIG = 'circuit'
const DEFAULT_POST_KARMA = 5
const DEFAULT_COMMENT_KARMA = 3
const MAX_KARMA_BUDGET = 10
const DEFAULT_AIRDROPPED_KARMA = 20

const UNIREP = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
const UNIREP_SOCIAL = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'

const circuitGlobalStateTreeDepth = 4;
const circuitUserStateTreeDepth = 4;
const circuitEpochTreeDepth = 32;
const circuitNullifierTreeDepth = 128;
const globalStateTreeDepth = 4;
const userStateTreeDepth = 4;
const epochTreeDepth = 32;
const nullifierTreeDepth = 128;
const maxUsers = 2 ** globalStateTreeDepth - 1;
const attestingFee = ethers.utils.parseEther("0.01")
const numEpochKeyNoncePerEpoch = 2;
const numAttestationsPerEpochKey = 6;
const epochLength = 30; 

export {
    SERVER,
    identityPrefix,
    identityCommitmentPrefix,
    epkProofPrefix,
    epkPublicSignalsPrefix,
    reputationProofPrefix,
    reputationPublicSignalsPrefix,
    signUpProofPrefix,
    signUpPublicSignalsPrefix,
    DEFAULT_ETH_PROVIDER,
    DEFAULT_START_BLOCK,
    DEFAULT_MAX_EPOCH_KEY_NONCE,
    DEFAULT_NUM_ATTESTATIONS_PER_EPOCH_KEY,
    DEFAULT_EPOCH_LENGTH,
    DEFAULT_ATTESTING_FEE,
    DEFAULT_TREE_DEPTHS_CONFIG,
    DEFAULT_POST_KARMA,
    DEFAULT_COMMENT_KARMA,
    MAX_KARMA_BUDGET,
    DEFAULT_AIRDROPPED_KARMA,
    UNIREP,
    UNIREP_SOCIAL,
    circuitGlobalStateTreeDepth,
    circuitUserStateTreeDepth,
    circuitEpochTreeDepth,
    circuitNullifierTreeDepth,
    userStateTreeDepth,
    epochTreeDepth,
    nullifierTreeDepth,
    maxUsers,
    attestingFee,
    numEpochKeyNoncePerEpoch,
    numAttestationsPerEpochKey,
    epochLength,
    globalStateTreeDepth
}