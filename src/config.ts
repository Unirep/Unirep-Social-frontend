import { ethers } from 'ethers'
import UnirepSocial from '@unirep/unirep-social/artifacts/contracts/UnirepSocial.sol/UnirepSocial.json'
import Unirep from '@unirep/contracts/artifacts/contracts/Unirep.sol/Unirep.json'

const EXPLORER_URL = 'https://kovan-optimistic.etherscan.io'

// const SERVER = 'https://unirep.tubby.cloud'
const SERVER = 'http://localhost:3001'
// const DEFAULT_ETH_PROVIDER_URL = 'ws://localhost:8545'
// const DEFAULT_ETH_PROVIDER_URL =
//     'https://arb-rinkeby.g.alchemy.com/v2/LzkSzVuFVZimTOB45xcCH3Cals4dTzk_'
// const DEFAULT_ETH_PROVIDER_URL =
    // 'https://opt-kovan.g.alchemy.com/v2/b5eaS0X3OMk54IppGh9ApffGoIOLIHOU'
const DEFAULT_ETH_PROVIDER_URL = 'http://localhost:8545'
const DEFAULT_ETH_PROVIDER = DEFAULT_ETH_PROVIDER_URL.startsWith('http')
    ? new ethers.providers.JsonRpcProvider(DEFAULT_ETH_PROVIDER_URL)
    : new ethers.providers.WebSocketProvider(DEFAULT_ETH_PROVIDER_URL)
// const DEFAULT_ETH_PROVIDER = 'http://18.188.136.227'

const UNIREP_SOCIAL_ABI = UnirepSocial.abi
const UNIREP_ABI = Unirep.abi

const ABOUT_URL = 'https://about.unirep.social'
const LOAD_POST_COUNT = 10

export {
    SERVER,
    DEFAULT_ETH_PROVIDER,
    DEFAULT_ETH_PROVIDER_URL,
    UNIREP_ABI,
    UNIREP_SOCIAL_ABI,
    ABOUT_URL,
    LOAD_POST_COUNT,
    EXPLORER_URL,
}
