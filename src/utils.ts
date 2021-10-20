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

const getEpochKey = async (epkNonce: number, id: any, epochTreeDepth: number, currentEpoch: number) => {
    const epochKey = genEpochKey(
        id.identityNullifier, 
        currentEpoch, epkNonce, epochTreeDepth
    );

    return epochKey.toString(16);
}

export const getEpochKeys = async (identity: string) => {
    const { id, userState, numEpochKeyNoncePerEpoch, currentEpoch, attesterId, hasSignedUp } = await getUserState(identity);

    const epochTreeDepth = (JSON.parse(userState.toJSON())).unirepState.epochTreeDepth;

    let epks: string[] = []
 
    if (hasSignedUp) {
        for (let i = 0; i < numEpochKeyNoncePerEpoch; i++) {
            const tmp = await getEpochKey(i, id, epochTreeDepth, currentEpoch);
            epks = [...epks, tmp];
        }
        console.log(epks)
    }

    return {epks, userState, currentEpoch, attesterId, hasSignedUp}
}

export const getAirdrop = async (identity: string) => {
    const { userState, attesterId } = await getUserState(identity);
    const results = await userState.genUserSignUpProof(BigInt(attesterId));
    console.log(results)

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

    return { transaction }
}

const genProof = async (identity: string, epkNonce: number = 0, proveKarmaAmount: number, minRep: number = 0) => {
    const {id, userState, currentEpoch, numEpochKeyNoncePerEpoch, attesterId} = await getUserState(identity);

    if (epkNonce >= numEpochKeyNoncePerEpoch) {
        console.error('no such epknonce available')
    }

    const proveGraffiti = BigInt(0);
    const graffitiPreImage = BigInt(0);
    const results = await userState.genProveReputationProof(
        BigInt(attesterId), 
        proveKarmaAmount, 
        epkNonce, BigInt(minRep), 
        proveGraffiti, graffitiPreImage
    );
    console.log(results)

    const epochTreeDepth = (JSON.parse(userState.toJSON())).unirepState.epochTreeDepth;
    const epk = await getEpochKey(epkNonce, id, epochTreeDepth, currentEpoch);
    const formattedProof = formatProofForVerifierContract(results.proof)
    const encodedProof = base64url.encode(JSON.stringify(formattedProof))
    const encodedPublicSignals = base64url.encode(JSON.stringify(results.publicSignals))
    const proof = config.reputationProofPrefix + encodedProof
    const publicSignals = config.reputationPublicSignalsPrefix + encodedPublicSignals

    return {epk, proof, publicSignals, currentEpoch}
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

// export const userSignIn = async (identityInput: string) => {
//     const encodedIdentity = identityInput.slice(config.identityPrefix.length)
//     const decodedIdentity = base64url.decode(encodedIdentity)
//     const id = unSerialiseIdentity(decodedIdentity)
//     const commitment = genIdentityCommitment(id)
//     const serializedCommitment = commitment.toString(16)
//     const encodedCommitment = base64url.encode(serializedCommitment)
    
//     const apiURL = makeURL('signin', {commitment: config.identityCommitmentPrefix + encodedCommitment})
    
//     let isSuccess
//     await fetch(apiURL).then(response => isSuccess = response);
//     return isSuccess
// }

export const publishPost = async (content: string, epkNonce: number, identity: string, minRep: number = 0) => {
    const ret = await genProof(identity, epkNonce, config.DEFAULT_POST_KARMA, minRep)

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
    
    return {transaction, postId, currentEpoch: ret.currentEpoch, epk: ret.epk}
}

export const vote = async(identity: string, upvote: number, downvote: number, postId: string, receiver: string, epkNonce: number = 0, minRep: number = 0, isPost: boolean = true) => {
    // upvote / downvote user 
    const voteValue = upvote + downvote
    const ret = await genProof(identity, epkNonce, voteValue, minRep)
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

    return {epk: ret.epk, transaction} 
}

export const leaveComment = async(identity: string, content: string, postId: string, epkNonce: number = 0, minRep: number = 0) => {
    const ret = await genProof(identity, epkNonce, config.DEFAULT_COMMENT_KARMA, minRep)

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
    
    return {transaction, commentId, currentEpoch: ret.currentEpoch, epk: ret.epk}
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

export const userStateTransition = async (identity: string) => {
    // const {userState, id, currentEpoch, treeDepths, numEpochKeyNoncePerEpoch} = await getUserState(identity);
    // const nullifierTreeDepth = treeDepths["nullifierTreeDepth"]
    // let circuitInputs: any

    // console.log('generating proving circuit from contract...')
    // circuitInputs = await userState.genUserStateTransitionCircuitInputs()
    
    // const results = await genVerifyUserStateTransitionProofAndPublicSignals(stringifyBigInts(circuitInputs));
    // const newGSTLeaf = results['publicSignals'][0]
    // const newState = await userState.genNewUserStateAfterTransition()
    // if (newGSTLeaf != newState.newGSTLeaf.toString()) {
    //     console.error('Error: Computed new GST leaf should match')
    //     return
    // }
    
    // const isValid = await verifyUserStateTransitionProof(results['proof'], results['publicSignals'])
    // if (!isValid) {
    //     console.error('Error: user state transition proof generated is not valid!')
    //     return
    // }

    // const fromEpoch = userState.latestTransitionedEpoch
    // const GSTreeRoot = userState.getUnirepStateGSTree(fromEpoch).root
    // const epochTreeRoot = (await userState.getUnirepStateEpochTree(fromEpoch)).getRootHash()
    // const nullifierTreeRoot = (await userState.getUnirepStateNullifierTree()).getRootHash()
    // const attestationNullifiers = userState.getAttestationNullifiers(fromEpoch)
    // const epkNullifiers = userState.getEpochKeyNullifiers(fromEpoch)
    // // Verify nullifiers outputted by circuit are the same as the ones computed off-chain
    // const outputAttestationNullifiers: BigInt[] = []
    // for (let i = 0; i < attestationNullifiers.length; i++) {
    //     const outputNullifier = results['publicSignals'][1+i]
    //     const modedOutputNullifier = BigInt(outputNullifier) % BigInt(2 ** nullifierTreeDepth)
    //     if (modedOutputNullifier != attestationNullifiers[i]) {
    //         console.error(`Error: nullifier outputted by circuit(${modedOutputNullifier}) does not match the ${i}-th computed attestation nullifier(${attestationNullifiers[i]})`)
    //         return
    //     }
    //     outputAttestationNullifiers.push(outputNullifier)
    // }
    // const outputEPKNullifiers: BigInt[] = []
    // for (let i = 0; i < epkNullifiers.length; i++) {
    //     const outputNullifier = results['publicSignals'][13+i]
    //     const modedOutputNullifier = BigInt(outputNullifier) % BigInt(2 ** nullifierTreeDepth)
    //     if (modedOutputNullifier != epkNullifiers[i]) {
    //         console.error(`Error: nullifier outputted by circuit(${modedOutputNullifier}) does not match the ${i}-th computed attestation nullifier(${epkNullifiers[i]})`)
    //         return
    //     }
    //     outputEPKNullifiers.push(outputNullifier)
    // }

    // const proof = formatProofForVerifierContract(results['proof'])
    // const apiURL = makeURL('userStateTransition', {})
    // const data = {
    //     newGSTLeaf,
    //     outputAttestationNullifiers,
    //     outputEPKNullifiers,
    //     fromEpoch,
    //     GSTreeRoot,
    //     epochTreeRoot,
    //     nullifierTreeRoot,
    //     proof
    // }

    // const stringifiedData = JSON.stringify(data, (key, value) => 
    //    typeof value === "bigint" ? value.toString() + "n" : value
    // )
    // console.log('before vote api: ' + stringifiedData)

    // let transaction: string = ''
    // let toEpoch: number = 0
    // await fetch(apiURL, {
    //     headers: header,
    //     body: stringifiedData,
    //     method: 'POST',
    // }).then(response => response.json())
    //    .then(function(data){
    //        console.log(JSON.stringify(data))
    //        transaction = data.transaction
    //        toEpoch = data.currentEpoch
    // });

    
    // return {transaction, toEpoch} 
    return {transaction: null, toEpoch: 2, userState: undefined};
}