import base64url from 'base64url'
import { ethers } from 'ethers'
import { genIdentity, genIdentityCommitment, serialiseIdentity, unSerialiseIdentity } from '@unirep/crypto'
import { genUserStateFromContract, genEpochKey } from '@unirep/unirep'
import { UnirepSocialContract } from '@unirep/unirep-social';
import * as config from './config'

const snarkjs = require("snarkjs")

const add0x = (str: string): string => {
    str = str.padStart(64,"0")
    return str.startsWith('0x') ? str : '0x' + str
}

/* circuit functions */
const formatProofForVerifierContract = (_proof: any) => {
    return ([
        _proof.pi_a[0],
        _proof.pi_a[1],
        _proof.pi_b[0][1],
        _proof.pi_b[0][0],
        _proof.pi_b[1][1],
        _proof.pi_b[1][0],
        _proof.pi_c[0],
        _proof.pi_c[1],
    ]).map((x) => x.toString());
};

const verifyProof = async (circuitName: string, proof: any, publicSignals: any) => {
    const vkeyJsonPath =  `/build/${circuitName}.vkey.json`;
    const vKey = await fetch(vkeyJsonPath).then( (res) => res.json());
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    return res;
};
/* circuit functions */

export const getUserState = async (identity: string) => {
    const provider = new ethers.providers.JsonRpcProvider(config.DEFAULT_ETH_PROVIDER)
    const unirepSocialContract = new UnirepSocialContract(config.UNIREP_SOCIAL, config.DEFAULT_ETH_PROVIDER);
    const unirepContract = await unirepSocialContract.getUnirep();

    const encodedIdentity = identity.slice(config.identityPrefix.length);
    const decodedIdentity = base64url.decode(encodedIdentity);
    const id = unSerialiseIdentity(decodedIdentity);
    const commitment = genIdentityCommitment(id);
    
    const userState = await genUserStateFromContract(
        provider,
        unirepContract.address,
        config.DEFAULT_START_BLOCK,
        id,
        commitment,
    );
    const numEpochKeyNoncePerEpoch = await unirepContract.numEpochKeyNoncePerEpoch();
    const currentEpoch = await unirepSocialContract.currentEpoch();
    const attesterId = await unirepSocialContract.attesterId();
    const jsonedUserState = JSON.parse(userState.toJSON());

    return {id, userState, numEpochKeyNoncePerEpoch, currentEpoch: Number(currentEpoch), attesterId, hasSignedUp: jsonedUserState.hasSignedUp};
}

const getEpochKey = async (epkNonce: number, id: any, epoch: number) => {
    const epochKey = genEpochKey(
        id.identityNullifier, 
        epoch, epkNonce, config.circuitEpochTreeDepth
    );

    return epochKey.toString(16);
}

export const getEpochKeys = async (id: any, epoch: number) => {
    let epks: string[] = []
 
    for (let i = 0; i < config.numEpochKeyNoncePerEpoch; i++) {
        const tmp = await getEpochKey(i, id, epoch);
        epks = [...epks, tmp];
    }
    console.log(epks)

    return epks
}

export const getAirdrop = async (identity: string, us: any) => {
    let userState: any = us;
    if (userState === null || userState === undefined) {
        const ret = await getUserState(identity);
        userState = ret.userState;
    }
    const unirepSocialContract = new UnirepSocialContract(config.UNIREP_SOCIAL, config.DEFAULT_ETH_PROVIDER);
    const attesterId = await unirepSocialContract.attesterId();
    let results: any;
    try {
        results = await userState.genUserSignUpProof(BigInt(attesterId));
        console.log(results)
    } catch (e) {
        const ret = await getUserState(identity);
        userState = ret.userState;
        results = await userState.genUserSignUpProof(BigInt(attesterId));
        console.log(results)
    }
    
    const formattedProof = formatProofForVerifierContract(results.proof)
    const encodedProof = base64url.encode(JSON.stringify(formattedProof))
    const encodedPublicSignals = base64url.encode(JSON.stringify(results.publicSignals))
    const signUpProof = config.signUpProofPrefix + encodedProof
    const signUpPublicSignals = config.signUpPublicSignalsPrefix + encodedPublicSignals
    
    const apiURL = makeURL('airdrop', {})
    const data = {
        proof: signUpProof, 
        publicSignals: signUpPublicSignals,
    }
    const stringifiedData = JSON.stringify(data)
    let transaction: string = ''
    await fetch(apiURL, {
            headers: header,
            body: stringifiedData,
            method: 'POST',
        }).then(response => response.json())
        .then(function(data){
            console.log(JSON.stringify(data))
            transaction = data.transaction
        });

    return { transaction, userState }
}

const genProof = async (identity: string, epkNonce: number = 0, proveKarmaAmount: number, minRep: number = 0, us: any) => {
    let userState: any = us;
    let currentEpoch: number;
    let numEpochKeyNoncePerEpoch: number;
    let attesterId: number;
    if (userState === null || userState === undefined) {
        const ret = await getUserState(identity);
        userState = ret.userState;
    }
    const unirepSocialContract = new UnirepSocialContract(config.UNIREP_SOCIAL, config.DEFAULT_ETH_PROVIDER);
    const unirepContract = await unirepSocialContract.getUnirep();

    const encodedIdentity = identity.slice(config.identityPrefix.length);
    const decodedIdentity = base64url.decode(encodedIdentity);
    const id = unSerialiseIdentity(decodedIdentity);

    numEpochKeyNoncePerEpoch = await unirepContract.numEpochKeyNoncePerEpoch();
    currentEpoch = Number(await unirepSocialContract.currentEpoch());
    attesterId = await unirepSocialContract.attesterId();

    if (epkNonce >= numEpochKeyNoncePerEpoch) {
        console.error('no such epknonce available')
    }

    const proveGraffiti = BigInt(0);
    const graffitiPreImage = BigInt(0);
    let results: any;
    try {
        results = await userState.genProveReputationProof(
            BigInt(attesterId), 
            proveKarmaAmount, 
            epkNonce, BigInt(minRep), 
            proveGraffiti, graffitiPreImage
        );
        console.log(results)
    } catch (e) {
        console.log(e);
        const ret = await getUserState(identity);
        userState = ret.userState;
        results = await userState.genProveReputationProof(
            BigInt(attesterId), 
            proveKarmaAmount, 
            epkNonce, BigInt(minRep), 
            proveGraffiti, graffitiPreImage
        );
        console.log(results)
    }    

    const epk = await getEpochKey(epkNonce, id, currentEpoch);
    const formattedProof = formatProofForVerifierContract(results.proof)
    const encodedProof = base64url.encode(JSON.stringify(formattedProof))
    const encodedPublicSignals = base64url.encode(JSON.stringify(results.publicSignals))
    const proof = config.reputationProofPrefix + encodedProof
    const publicSignals = config.reputationPublicSignalsPrefix + encodedPublicSignals

    return {epk, proof, publicSignals, currentEpoch, userState}
}

const makeURL = (action: string, data: any) => {
    let dataStr: string = ''

    for (let k of Object.keys(data)) {
        dataStr = dataStr + k + '=' + data[k] + '&'
    }

    return config.SERVER + '/api/' + action + '?' + dataStr
}

const header = {
    'content-type': 'application/json',
    'Access-Control-Allow-Origin': config.SERVER,
    'Access-Control-Allow-Credentials': 'true',
}

export const checkInvitationCode = async (invitationCode: string) => {
    const apiURL = makeURL('genInvitationCode/' + invitationCode, {})
    var ret = false
    await fetch(apiURL)
        .then(response => ret = (response.ok === true));
    return ret
}

export const userSignUp = async () => {
    const id = genIdentity()
    const commitment = genIdentityCommitment(id)

    const serializedIdentity = serialiseIdentity(id)
    const encodedIdentity = base64url.encode(serializedIdentity)
    console.log(config.identityPrefix + encodedIdentity)

    const serializedIdentityCommitment = commitment.toString(16)
    const encodedIdentityCommitment = base64url.encode(serializedIdentityCommitment)
    console.log(config.identityCommitmentPrefix + encodedIdentityCommitment)

    // call server user sign up
    let epoch: number = 0
    const apiURL = makeURL('signup', {commitment: config.identityCommitmentPrefix + encodedIdentityCommitment})
    await fetch(apiURL)
        .then(response => response.json())
        .then(function(data){
            console.log(data)
            epoch = data.epoch
        });

    return {i: config.identityPrefix + encodedIdentity, c: config.identityCommitmentPrefix + encodedIdentityCommitment, epoch }
}


export const publishPost = async (content: string, epkNonce: number, identity: string, minRep: number = 0, us: any) => {
    const ret = await genProof(identity, epkNonce, config.DEFAULT_POST_KARMA, minRep, us)

    if (ret === undefined) {
        console.error('genProof error, ret is undefined.')
    }

     // to backend: proof, publicSignals, content
     const apiURL = makeURL('post', {})
     const data = {
        content,
        proof: ret.proof, 
        minRep,
        publicSignals: ret.publicSignals,
     }
     const stringifiedData = JSON.stringify(data)
     console.log('before publish post api: ' + stringifiedData)
     
     let transaction: string = ''
     let postId: string = ''
     await fetch(apiURL, {
         headers: header,
         body: stringifiedData,
         method: 'POST',
     }).then(response => response.json())
        .then(function(data){
            console.log(JSON.stringify(data))
            transaction = data.transaction
            postId = data.postId
        });
    
    return {transaction, postId, currentEpoch: ret.currentEpoch, epk: ret.epk, userState: ret.userState}
}

export const vote = async(identity: string, upvote: number, downvote: number, postId: string, receiver: string, epkNonce: number = 0, minRep: number = 0, isPost: boolean = true, us: any) => {
    // upvote / downvote user 
    const voteValue = upvote + downvote
    const ret = await genProof(identity, epkNonce, voteValue, minRep, us)
    if (ret === undefined) {
        console.error('genProof error, ret is undefined.')
    }

    // send publicsignals, proof, voted post id, receiver epoch key, graffiti to backend  
    const apiURL = makeURL('vote', {})
    const data = {
       upvote,
       downvote,
       proof: ret.proof, 
       minRep,
       publicSignals: ret.publicSignals,
       receiver,
       postId,
       isPost
    }
    const stringifiedData = JSON.stringify(data);
    console.log('before vote api: ' + stringifiedData)
    
    let transaction: string = ''
    await fetch(apiURL, {
        headers: header,
        body: stringifiedData,
        method: 'POST',
    }).then(response => response.json())
       .then(function(data){
           console.log(JSON.stringify(data))
           transaction = data.transaction
       });

    return {epk: ret.epk, transaction, userState: ret.userState} 
}

export const leaveComment = async(identity: string, content: string, postId: string, epkNonce: number = 0, minRep: number = 0, us: any) => {
    const ret = await genProof(identity, epkNonce, config.DEFAULT_COMMENT_KARMA, minRep, us)

    if (ret === undefined) {
        console.error('genProof error, ret is undefined.')
    }

     // to backend: proof, publicSignals, content
     const apiURL = makeURL('comment', {})
     const data = {
        content,
        proof: ret.proof, 
        minRep,
        postId,
        publicSignals: ret.publicSignals,
     }
     const stringifiedData = JSON.stringify(data)
     console.log('before leave comment api: ' + stringifiedData)
     
     let transaction: string = ''
     let commentId: string = ''
     await fetch(apiURL, {
         headers: header,
         body: stringifiedData,
         method: 'POST',
     }).then(response => response.json())
        .then(function(data){
            console.log(JSON.stringify(data))
            transaction = data.transaction
            commentId = data.commentId
        });
    
    return {transaction, commentId, currentEpoch: ret.currentEpoch, epk: ret.epk, userState: ret.userState}
}

export const getNextEpochTime = async () => {
    const apiURL = makeURL('epochTransition', {})
    var ret = 0
    await fetch(apiURL)
        .then(response => response.json())
        .then(function(data){
            ret = data;
        });
    console.log(ret);
    return ret
}

export const userStateTransition = async (identity: string, us: any) => {
    const {userState} = await getUserState(identity);
    const results = await userState.genUserStateTransitionProofs();

    const fromEpoch = userState.latestTransitionedEpoch;
    const toEpoch = userState.getUnirepStateCurrentEpoch();

    const apiURL = makeURL('userStateTransition', {})
    const data = {
        results,
        fromEpoch,
    }

    const stringifiedData = JSON.stringify(data)
    console.log('before UST api: ' + stringifiedData)

    let transaction: string = ''
    await fetch(apiURL, {
        headers: header,
        body: stringifiedData,
        method: 'POST',
    }).then(response => response.json())
       .then(function(data){
           console.log(JSON.stringify(data))
           transaction = data.transaction
    });
    
    return {transaction, toEpoch}
}