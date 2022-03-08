import { ethers } from 'ethers'
import { circuitUserStateTreeDepth, circuitGlobalStateTreeDepth, circuitEpochTreeDepth } from '@unirep/unirep'
import UnirepSocial from "../node_modules/@unirep/unirep-social/artifacts/contracts/UnirepSocial.sol/UnirepSocial.json"

const identityPrefix = 'Unirep.identity.'
const identityCommitmentPrefix = 'Unirep.identityCommitment.'
const epkProofPrefix = 'Unirep.epk.proof.'
const epkPublicSignalsPrefix = 'Unirep.epk.publicSignals.'
const reputationProofPrefix = 'Unirep.reputation.proof.'
const reputationPublicSignalsPrefix = 'Unirep.reputation.publicSignals.'
const signUpProofPrefix = 'Unirep.signUp.proof.'
const signUpPublicSignalsPrefix = 'Unirep.signUp.publicSignals.'

// const SERVER = 'http://localhost:3001'
const DEFAULT_ETH_PROVIDER_URL = 'ws://localhost:8545'
const SERVER = 'https://unirep.social/'
// const SERVER = 'http://3.20.204.166'
// const DEFAULT_ETH_PROVIDER_URL = 'wss://eth-goerli.alchemyapi.io/v2/tYp-IJU_idg28iohx9gsLqhq6KRZxk7f'
const DEFAULT_ETH_PROVIDER = new ethers.providers.WebSocketProvider(DEFAULT_ETH_PROVIDER_URL)
// const DEFAULT_ETH_PROVIDER = 'http://18.188.136.227'
const DEFAULT_START_BLOCK = 0
const DEFAULT_MAX_EPOCH_KEY_NONCE = 2
const DEFAULT_NUM_ATTESTATIONS_PER_EPOCH_KEY = 6
const DEFAULT_EPOCH_LENGTH = 30
const DEFAULT_ATTESTING_FEE = ethers.utils.parseEther("0")
const DEFAULT_TREE_DEPTHS_CONFIG = 'circuit'
const DEFAULT_POST_KARMA = 5
const DEFAULT_COMMENT_KARMA = 3
const MAX_KARMA_BUDGET = 10
const DEFAULT_AIRDROPPED_KARMA = 30

const UNIREP = '0x0165878A594ca255338adfa4d48449f69242Eb8F'
const UNIREP_SOCIAL = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
// const UNIREP = '0xE7709F35fb195E1D117D486aEB24bA58CEccCD29';
// const UNIREP_SOCIAL = '0x0F50453236B2Ca88D5C1fBC8D7FA91001d93eC68';
const UNIREP_SOCIAL_ABI = UnirepSocial.abi
const UNIREP_SOCIAL_ATTESTER_ID = 1

const circuitNullifierTreeDepth = 128;
const globalStateTreeDepth = 4;
const userStateTreeDepth = 4;
const epochTreeDepth = 32;
const nullifierTreeDepth = 128;
const maxUsers = 2 ** globalStateTreeDepth - 1;
const attestingFee = ethers.utils.parseEther("0")
const numEpochKeyNoncePerEpoch = 3;
const numAttestationsPerEpochKey = 6;
const epochLength = 30;
const maxReputationBudget = 10;

const ABOUT_URL = "https://about.unirep.social";
const LOAD_POST_COUNT = 10

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
    UNIREP_SOCIAL_ABI,
    UNIREP_SOCIAL_ATTESTER_ID,
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
    globalStateTreeDepth,
    maxReputationBudget,
    ABOUT_URL,
    LOAD_POST_COUNT
}
