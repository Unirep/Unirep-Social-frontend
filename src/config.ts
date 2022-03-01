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

const SERVER = 'http://backend:3001'
// const DEFAULT_ETH_PROVIDER = 'http://localhost:8545'
// const SERVER = 'http://backend:3001'
const DEFAULT_ETH_PROVIDER = 'https://eth-goerli.alchemyapi.io/v2/tYp-IJU_idg28iohx9gsLqhq6KRZxk7f'
// const DEFAULT_ETH_PROVIDER = 'https://hardhat.unirep.social'
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

const UNIREP = '0x6F559A43190f11F8A4F66BC38525A128D9Dc3F79'
const UNIREP_SOCIAL = '0xe9D09cF3CEDCC7b9aAbeaDA8A11998E7c47C332D'
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

export {
    // SERVER,
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
    ABOUT_URL
}
