import base64url from 'base64url';
import { ethers } from 'ethers';
import { getUnirepContract } from '@unirep/contracts';
import { genIdentity, genIdentityCommitment, serialiseIdentity, unSerialiseIdentity } from '@unirep/crypto';
import { genUserStateFromContract, genEpochKey, genUserStateFromParams } from '@unirep/unirep';
import { UnirepSocialContract } from '@unirep/unirep-social';
import * as config from './config';
import { Record, Post, DataType, Vote, Comment, ActionType, QueryType } from './constants';

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

export const getCurrentEpoch = async () => {
    const unirepSocialContract = new UnirepSocialContract(config.UNIREP_SOCIAL, config.DEFAULT_ETH_PROVIDER);
    const unirepContract = await unirepSocialContract.getUnirep()
    const currentEpoch = await unirepContract.currentEpoch()
    return Number(currentEpoch)
}

const decodeIdentity = (identity: string) => {
    const encodedIdentity = identity.slice(config.identityPrefix.length);
    const decodedIdentity = base64url.decode(encodedIdentity);
    
    let commitment
    try {
        const id = unSerialiseIdentity(decodedIdentity);
        commitment = genIdentityCommitment(id);
        return { id, commitment, identityNullifier:  id.identityNullifier}
    } catch(e) {
        console.log('Incorrect Identity format\n', e)
        return { id: BigInt(0), commitment: BigInt(0), identityNullifier: BigInt(0) }
    }
}

export const hasSignedUp = async (identity: string) => {
    const provider = new ethers.providers.JsonRpcProvider(config.DEFAULT_ETH_PROVIDER)
    const unirepContract = getUnirepContract(config.UNIREP, provider)

    const { commitment } = decodeIdentity(identity)

    // If user has signed up in Unirep
    const hasUserSignUp = await unirepContract.hasUserSignedUp(commitment)
    return {
        hasSignedUp: hasUserSignUp, 
    }
}

const hasSignedUpInUnirepSocial = async (identityCommitment: BigInt) => {
    const ethProvider = config.DEFAULT_ETH_PROVIDER
    const provider = new ethers.providers.JsonRpcProvider(ethProvider)
    const unirepSocial = new ethers.Contract(
        config.UNIREP_SOCIAL,
        config.UNIREP_SOCIAL_ABI,
        provider,
    )
    const userSignUpFilter = unirepSocial.filters.UserSignedUp(null, identityCommitment)
    const userSignUpEvent = await unirepSocial.queryFilter(userSignUpFilter)
    if(userSignUpEvent.length === 1) return { epoch: userSignUpEvent[0]?.args?._epoch, hasSignedUp: true}
    return {epoch: 0, hasSignedUp: false}
}

export const getUserState = async (identity: string, us?: any, update?: boolean) => {
    const { id }  = decodeIdentity(identity);
    let userState
    const startTime = new Date().getTime()
    if((us === undefined || us === null) && update === false) {
        console.log('gen user state from stored us')
        userState = genUserStateFromParams(
            id,
            JSON.parse(us),
        )
        const endTime = new Date().getTime()
        console.log(`Gen us time: ${endTime - startTime} ms (${Math.floor((endTime - startTime) / 1000)} s)`)
    } else {
        const provider = new ethers.providers.JsonRpcProvider(config.DEFAULT_ETH_PROVIDER)
        const unirepSocialContract = new UnirepSocialContract(config.UNIREP_SOCIAL, config.DEFAULT_ETH_PROVIDER);
        const unirepContract = await unirepSocialContract.getUnirep();
        const parsedUserState = us !== undefined ? JSON.parse(us) : us
        console.log('update user state from stored us')
        userState = await genUserStateFromContract(
            provider,
            unirepContract.address,
            id,
            parsedUserState,
        );
        const endTime = new Date().getTime()
        console.log(`Gen us time: ${endTime - startTime} ms (${Math.floor((endTime - startTime) / 1000)} s)`)
    }
    
    const numEpochKeyNoncePerEpoch = config.numEpochKeyNoncePerEpoch;
    const attesterId = config.UNIREP_SOCIAL_ATTESTER_ID;
    const jsonedUserState = JSON.parse(userState.toJSON());
    const currentEpoch = userState.getUnirepStateCurrentEpoch()

    return {id, userState: userState, numEpochKeyNoncePerEpoch, currentEpoch: Number(currentEpoch), attesterId, hasSignedUp: jsonedUserState.hasSignedUp};
}

const getEpochKey = (epkNonce: number, identityNullifier: any, epoch: number) => {
    const epochKey = genEpochKey(
        identityNullifier, 
        epoch, epkNonce, config.circuitEpochTreeDepth
    );

    return epochKey.toString(16);
}

export const getEpochKeys = (identity: string, epoch: number) => {
    const { identityNullifier } = decodeIdentity(identity)
    let epks: string[] = []
 
    for (let i = 0; i < config.numEpochKeyNoncePerEpoch; i++) {
        const tmp = getEpochKey(i, identityNullifier, epoch);
        epks = [...epks, tmp];
    }
    // console.log(epks)

    return epks;
}

const genAirdropProof = async (identity: string, us: any) => {
    let userState: any = us;
    if (userState === null || userState === undefined) {
        const ret = await getUserState(identity, us, false);
        userState = ret.userState;
    }
    const attesterId = config.UNIREP_SOCIAL_ATTESTER_ID;
    let results: any;
    try {
        results = await userState.genUserSignUpProof(BigInt(attesterId));
        console.log(results)
        console.log('---userState---');
        console.log(userState.toJSON());
    } catch (e) {
        const ret = await getUserState(identity, us, true);
        userState = ret.userState;
        results = await userState.genUserSignUpProof(BigInt(attesterId));
        console.log(results)
    }
    
    const formattedProof = formatProofForVerifierContract(results.proof)
    const encodedProof = base64url.encode(JSON.stringify(formattedProof))
    const encodedPublicSignals = base64url.encode(JSON.stringify(results.publicSignals))
    const signUpProof = config.signUpProofPrefix + encodedProof
    const signUpPublicSignals = config.signUpPublicSignalsPrefix + encodedPublicSignals

    return {
        proof: signUpProof,
        publicSignals: signUpPublicSignals,
        userState: userState,
    }
}

// export const signUpUnirepUser = async (identity: string, us: any) => {
//     const { proof, publicSignals, userState } = await genAirdropProof(identity, us);
    
//     const apiURL = makeURL('signup', {})
//     const data = {
//         proof: proof, 
//         publicSignals: publicSignals,
//     }
//     const stringifiedData = JSON.stringify(data)
//     let transaction: string = ''
//     await fetch(apiURL, {
//             headers: header,
//             body: stringifiedData,
//             method: 'POST',
//         }).then(response => response.json())
//         .then(function(data){
//             console.log(JSON.stringify(data))
//             transaction = data.transaction
//         });

//     return { transaction, userState }
// }
 
export const getAirdrop = async (identity: string, us: any) => {
    let error
    let transaction: string = ''
    const provider = new ethers.providers.JsonRpcProvider(config.DEFAULT_ETH_PROVIDER)
    const unirepSocial = new ethers.Contract(
        config.UNIREP_SOCIAL,
        config.UNIREP_SOCIAL_ABI,
        provider,
    )
    const { proof, publicSignals, userState } = await genAirdropProof(identity, us);
    const { identityNullifier } = decodeIdentity(identity)
    const epk = genEpochKey(identityNullifier, userState.getUnirepStateCurrentEpoch(), 0)
    const gotAirdrop = await unirepSocial.isEpochKeyGotAirdrop(epk)
    if (gotAirdrop) return { error: 'The epoch key has been airdropped.'}
    
    const apiURL = makeURL('airdrop', {})
    const data = {
        proof: proof, 
        publicSignals: publicSignals,
    }
    const stringifiedData = JSON.stringify(data)
    await fetch(apiURL, {
            headers: header,
            body: stringifiedData,
            method: 'POST',
        }).then(response => response.json())
        .then(function(data){
            console.log(JSON.stringify(data))
            error = data.error
            transaction = data.transaction
        });

    return { error, transaction, userState }
}

const genProof = async (identity: string, epkNonce: number = 0, proveKarmaAmount: number, minRep: number = 0, us: any, spent: number = -1) => {
    let userState: any = us;
    let currentEpoch: number;
    let numEpochKeyNoncePerEpoch: number;
    let attesterId: number;
    if (userState === null || userState === undefined) {
        const ret = await getUserState(identity, us, true);
        userState = ret.userState;
    } else {
        const ret = await getUserState(identity, us, false);
        userState = ret.userState;
    }
    const unirepSocialContract = new UnirepSocialContract(config.UNIREP_SOCIAL, config.DEFAULT_ETH_PROVIDER);
    const unirepContract = await unirepSocialContract.getUnirep();
    const { identityNullifier } = decodeIdentity(identity);

    numEpochKeyNoncePerEpoch = await unirepContract.numEpochKeyNoncePerEpoch();
    currentEpoch = Number(await unirepSocialContract.currentEpoch());
    const epk = await getEpochKey(epkNonce, identityNullifier, currentEpoch);
    attesterId = config.UNIREP_SOCIAL_ATTESTER_ID;

    if (epkNonce >= numEpochKeyNoncePerEpoch) {
        console.error('no such epknonce available')
    }

    let rep: any;
    try {
        rep = userState.getRepByAttester(attesterId);
    } catch (e) {
        const ret = await getUserState(identity);
        userState = ret.userState;
        rep = userState.getRepByAttester(attesterId);
    }

    console.log(userState.toJSON(4));

    // find valid nonce starter
    const nonceList: BigInt[] = [];
    let nonceStarter: number = spent;
    // for (let n = 0; n < Number(rep.posRep) - Number(rep.negRep); n++) {
    //     const reputationNullifier = genReputationNullifier(id.identityNullifier, currentEpoch, n, BigInt(attesterId))
    //     if(!userState.nullifierExist(reputationNullifier)) {
    //         nonceStarter = n
    //         break
    //     }
    // }
    if(nonceStarter === -1) {
        console.error('Error: All nullifiers are spent')
    }
    if((nonceStarter + proveKarmaAmount) > Number(rep.posRep) - Number(rep.negRep)){
        console.error('Error: Not enough reputation to spend')
    }
    for (let i = 0; i < proveKarmaAmount; i++) {
        nonceList.push( BigInt(nonceStarter + i) )
    }
    for (let i = proveKarmaAmount; i < config.maxReputationBudget ; i++) {
        nonceList.push(BigInt(-1))
    }

    // gen proof
    const startTime = new Date().getTime()
    const proveGraffiti = BigInt(0);
    const graffitiPreImage = BigInt(0);
    let results
    try {
        results = await userState.genProveReputationProof(BigInt(attesterId), epkNonce, BigInt(minRep), proveGraffiti, graffitiPreImage, nonceList)
    } catch (e) {
        console.log(e)
        return undefined
    }
    
    console.log(results)
    const endTime = new Date().getTime()
    console.log(`Gen proof time: ${endTime - startTime} ms (${Math.floor((endTime - startTime) / 1000)} s)`)

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

    const unirepSocialContract = new UnirepSocialContract(config.UNIREP_SOCIAL, config.DEFAULT_ETH_PROVIDER);
    const currentEpoch = await unirepSocialContract.currentEpoch();
    const epk1 = await getEpochKey(0, id.identityNullifier, currentEpoch);

    const serializedIdentityCommitment = commitment.toString(16)
    const encodedIdentityCommitment = base64url.encode(serializedIdentityCommitment)
    console.log(config.identityCommitmentPrefix + encodedIdentityCommitment)

    // call server user sign up
    let epoch: number = 0
    const apiURL = makeURL('signup', {commitment: config.identityCommitmentPrefix + encodedIdentityCommitment, epk: epk1})
    await fetch(apiURL)
        .then(response => response.json())
        .then(function(data){
            console.log(data)
            epoch = data.epoch
        });

    return {i: config.identityPrefix + encodedIdentity, c: config.identityCommitmentPrefix + encodedIdentityCommitment, epoch }
}


export const publishPost = async (content: string, epkNonce: number, identity: string, minRep: number = 0, spent: number = 0, us: any, title: string = '') => {
    let error
    let transaction: string = ''
    const ret = await genProof(identity, epkNonce, config.DEFAULT_POST_KARMA, minRep, us, spent)

    if (ret === undefined) {
        error = 'genProof error, ret is undefined.'
        return {error, transaction, currentEpoch: 0, epk: '', userState: undefined}
    }

     // to backend: proof, publicSignals, content
     const apiURL = makeURL('post', {})
     const data = {
        title,
        content,
        proof: ret.proof, 
        minRep,
        publicSignals: ret.publicSignals,
     }
     const stringifiedData = JSON.stringify(data)
     console.log('before publish post api: ' + stringifiedData)
     
     await fetch(apiURL, {
         headers: header,
         body: stringifiedData,
         method: 'POST',
     }).then(response => response.json())
        .then(function(data){
            console.log(JSON.stringify(data))
            error = data.error
            transaction = data.transaction
        });
    
    return {error, transaction, currentEpoch: ret.currentEpoch, epk: ret.epk, userState: ret.userState}
}

export const vote = async(identity: string, upvote: number, downvote: number, dataId: string, receiver: string, epkNonce: number = 0, minRep: number = 0, isPost: boolean = true, spent: number = 0, us: any) => {
    let error
    let transaction: string = ''
    // upvote / downvote user 
    const voteValue = upvote + downvote
    const ret = await genProof(identity, epkNonce, voteValue, minRep, us, spent)
    if (ret === undefined) {
        error = 'genProof error, ret is undefined.'
        return {error, epk: '', transaction: undefined, userState: undefined} 
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
       dataId,
       isPost
    }
    const stringifiedData = JSON.stringify(data);
    console.log('before vote api: ' + stringifiedData)
    
    await fetch(apiURL, {
        headers: header,
        body: stringifiedData,
        method: 'POST',
    }).then(response => response.json())
       .then(function(data){
           console.log(JSON.stringify(data))
           error = data.error
           transaction = data.transaction
       });

    return {error, epk: ret.epk, transaction, userState: ret.userState} 
}

export const leaveComment = async(identity: string, content: string, postId: string, epkNonce: number = 0, minRep: number = 0, spent: number = 0, us: any) => {
    let error
    let transaction: string = ''
    let commentId: string = ''
    const ret = await genProof(identity, epkNonce, config.DEFAULT_COMMENT_KARMA, minRep, us, spent)

    if (ret === undefined) {
        error = 'genProof error, ret is undefined.'
        return {error, transaction, commentId, currentEpoch: 0, epk: '', userState: undefined}
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
     
     await fetch(apiURL, {
         headers: header,
         body: stringifiedData,
         method: 'POST',
     }).then(response => response.json())
        .then(function(data){
            console.log(JSON.stringify(data))
            error = data.error
            transaction = data.transaction
            commentId = data.commentId
        });
    
    return {error, transaction, commentId, currentEpoch: ret.currentEpoch, epk: ret.epk, userState: ret.userState}
}

export const updateUserState = async (identity: string, us?: any) => {
    let airdropRet
    const ret = await getUserState(identity, us, true);
    if(ret.currentEpoch !== ret.userState.latestTransitionedEpoch) {
        const transitionRet = await userStateTransition(identity, ret.userState.toJSON());
        const userStateResult = await getUserState(identity, transitionRet.userState.toJSON(), true);
        airdropRet = await getAirdrop(identity, userStateResult.userState);
    }
    const epks = getEpochKeys(identity, ret.currentEpoch);
    const spent = await getEpochSpent(epks);
    return { error: airdropRet?.error, userState: ret.userState, spent: spent };
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
    
    return {transaction, toEpoch, userState}
}

export const getRecords = async (currentEpoch: number, identity: string) => {
    const { commitment } = decodeIdentity(identity)
    let epks: string[] = [];
    for (var i = 1; i <= currentEpoch; i ++) {
        const epksRet = getEpochKeys(identity, i);
        epks = [...epks, ...epksRet];
    }

    const commitmentAPIURL = makeURL(`records`, {commitment})
    const paramStr = epks.join('_');
    const apiURL = makeURL(`records/${paramStr}`, {});
    console.log(apiURL);

    const getCommitment = new Promise<Record>(resolve => {
        fetch(commitmentAPIURL).then(response => response.json()).then(
            (data) => {
                if(data.length === 0) return;
                const signupRecord: Record = {
                    action: ActionType.Signup,
                    from: 'SignUp Airdrop',
                    to: data[0].to,
                    upvote: config.DEFAULT_AIRDROPPED_KARMA,
                    downvote: 0,
                    epoch: data[0].epoch,
                    time: Date.parse(data[0].created_at),
                    data_id: '',
                    content: ''
                }
                resolve(signupRecord);
            }
        );
    });

    const getGeneralRecords = new Promise<Record[]>(resolve => {
        fetch(apiURL).then(response => response.json()).then(
            (data) => {
                let records: Record[] = [];
                for (var i = 0; i < data.length; i ++) {
                    const record: Record = {
                        action: data[i].action,
                        from: data[i].from,
                        to: data[i].to,
                        upvote: data[i].upvote,
                        downvote: data[i].downvote,
                        epoch: data[i].epoch,
                        time: Date.parse(data[i].created_at),
                        data_id: data[i].data,
                        content: data[i].content,
                    }
                    records = [record, ...records];
                }
                console.log(data.length);
                console.log(records);
                resolve(records);
            }
        );
    });

    const ret = Promise.all([
        getCommitment, getGeneralRecords
    ]).then(result => {
        return [result[0]].concat(result[1]);
    });

    return ret;
}

export const getEpochSpent = async (epks: string[]) => {
    const paramStr = epks.join('_');
    const apiURL = makeURL(`records/${paramStr}`, {spentonly: true});
    console.log(apiURL);

    
    return await fetch(apiURL).then(response => response.json()).then(
        data => {
            let ret: number = 0;
            console.log(data);
            for (var i = 0; i < data.length; i ++) {
                ret = ret + data[i].spent;
            }
            console.log('inside get epoch spent: ' + ret);
            return ret;
        }
    );
}

const convertDataToVotes = (data: any) => {
    if (data === null || data === undefined) return {votes: [], upvote: 0, downvote: 0};
    let votes: Vote[] = [];
    let upvote: number = 0;
    let downvote: number = 0;
    for (var i = 0; i < data.length; i ++) {
        const posRep = Number(data[i].posRep);
        const negRep = Number(data[i].negRep);
        const vote: Vote = {
            upvote: posRep,
            downvote: negRep,
            epoch_key: data[i].voter,
        }
        upvote += posRep;
        downvote += negRep;
        votes = [...votes, vote];
    }

    return {votes, upvote, downvote};
}

const convertDataToComment = (data: any) => {
    const {votes, upvote, downvote} = convertDataToVotes(data.votes); 
    const comment = {
        type: DataType.Comment,
        id: data.transactionHash,
        post_id: data.postId,
        content: data.content,
        votes,
        upvote,
        downvote,
        epoch_key: data.epochKey,
        username: '',
        post_time: Date.parse(data.created_at),
        reputation: data.minRep,
        current_epoch: data.epoch,
        proofIndex: data.proofIndex,
    }

    return comment;
}

const convertDataToPost = (data: any, commentsOnlyId: boolean = true) => {
    
    const {votes, upvote, downvote} = convertDataToVotes(data.votes); 

    let comments: Comment[] = [];
    if (!commentsOnlyId) {
        for (var i = 0; i < data.comments.length; i ++) {
            const comment = convertDataToComment(data.comments[i]);
            comments = [...comments, comment];
        }
    }

    const post: Post = {
        type: DataType.Post,
        id: data.transactionHash,
        title: data.title,
        content: data.content,
        votes,
        upvote,
        downvote, 
        epoch_key: data.epochKey,
        username: '',
        post_time: Date.parse(data.created_at),
        reputation: data.minRep,
        comments,
        commentsCount: data.comments.length,
        current_epoch: data.epoch,
        proofIndex: data.proofIndex,
    }

    return post;
}

export const listAllPosts = async () => {
    const apiURL = makeURL(`post`, {});
    
    let ret: Post[] = [];
    await fetch(apiURL).then(response => response.json()).then(
        data => {
            console.log(data);
            for (var i = 0; i < data.length; i ++) {
                const post = convertDataToPost(data[i]);
                ret = [...ret, post];
            }
        }
    );

    return ret;
}

export const getPostById = async (postid: string) => {
    const apiURL = makeURL(`post/${postid}`, {});
    let ret: any;
    await fetch(apiURL).then(response => response.json()).then(
        data => {
            console.log(data);
            ret = convertDataToPost(data, false);
        }
    );
    return ret;
}

export const getPostsByQuery = async (query: QueryType, lastRead: string = '0', epks: string[] = []) => {
    const apiURL = makeURL(`post`, {query, lastRead, epks: epks.join('_')});
    console.log(apiURL);

    let ret: Post[] = [];
    await fetch(apiURL).then(response => response.json()).then(
        data => {
            console.log(data);
            for (var i = 0; i < data.length; i ++) {
                const post = convertDataToPost(data[i]);
                ret = [...ret, post];
            }
        }
    );

    return ret;
}

export const getCommentsByQuery = async (query: QueryType, lastRead: string = '0', epks: string[] = []) => {
    const apiURL = makeURL(`comment`, {query, lastRead, epks: epks.join('_')});
    console.log(apiURL);

    let ret: Comment[] = [];
    await fetch(apiURL).then(response => response.json()).then(
        data => {
            console.log(data);
            for (var i = 0; i < data.length; i ++) {
                const comment = convertDataToComment(data[i]);
                ret = [...ret, comment];
            }
        }
    );

    return ret;
}

export const sentReport = async (issue: string, email: string) => {
    const apiURL = makeURL(`report`, {issue, email});
    
    let ret: boolean = true;
    await fetch(apiURL).then(response => ret = (response.ok === true));

    return ret;
}
