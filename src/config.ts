import { ethers } from 'ethers'
import { circuitUserStateTreeDepth, circuitGlobalStateTreeDepth, circuitEpochTreeDepth } from '@unirep/unirep'
import UnirepSocial from "@unirep/unirep-social/artifacts/contracts/UnirepSocial.sol/UnirepSocial.json"

const DEFAULT_ETH_PROVIDER_URL = 'https://kovan.optimism.io'
const ETH_PROVIDER_ETHERSCAN = 'https://kovan-optimistic.etherscan.io'
const DEFAULT_ETH_PROVIDER = DEFAULT_ETH_PROVIDER_URL.startsWith('http') ?
  new ethers.providers.JsonRpcProvider(DEFAULT_ETH_PROVIDER_URL) :
  new ethers.providers.WebSocketProvider(DEFAULT_ETH_PROVIDER_URL)

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

const UNIREP = '0x2167b6494f0DbD093CFE54a2C7bCB91525Ea678B'
const UNIREP_SOCIAL = '0x6EDa9692a85B744C057a05D67a677cfA44078eAf'
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
    ETH_PROVIDER_ETHERSCAN,
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
