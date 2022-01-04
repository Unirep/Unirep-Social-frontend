import base64url from 'base64url';
import { ethers } from 'ethers';
import { genIdentity, genIdentityCommitment, serialiseIdentity, unSerialiseIdentity } from '@unirep/crypto';
import { genUserStateFromContract, genEpochKey, genReputationNullifier } from '@unirep/unirep';
import { UnirepSocialContract } from '@unirep/unirep-social';
import * as config from './config';
import { History, Post, DataType, Vote, Comment, ActionType } from './constants';

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

export const hasSignedUp = async (identity: string) => {
    const provider = new ethers.providers.JsonRpcProvider(config.DEFAULT_ETH_PROVIDER)
    const unirepSocialContract = new ethers.Contract(
        config.UNIREP_SOCIAL,
        config.UNIREP_SOCIAL_ABI,
        provider,
    )

    const encodedIdentity = identity.slice(config.identityPrefix.length);
    const decodedIdentity = base64url.decode(encodedIdentity);
    
    let commitment
    try {
        const id = unSerialiseIdentity(decodedIdentity);
        commitment = genIdentityCommitment(id);
    } catch(e) {
        console.log('Incorrect Identity format\n', e)
        return
    }

    const signUpFilter = unirepSocialContract.filters.UserSignedUp(null, commitment)
    const signUpEvents =  await unirepSocialContract.queryFilter(signUpFilter, config.DEFAULT_START_BLOCK)

    if(signUpEvents.length == 1) {
        return {
            hasSignedUp: true, 
            signedUpEpoch: Number(signUpEvents[0]?.args?._epoch)
        }
    }

    return {
        hasSignedUp: false, 
        signedUpEpoch: 0
    }
}

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

export const getEpochKeys = async (identity: string, epoch: number) => {
    // const encodedIdentity = identity.slice(config.identityPrefix.length);
    // const decodedIdentity = base64url.decode(encodedIdentity);
    // const id = unSerialiseIdentity(decodedIdentity);
    
    // let epks: string[] = []
 
    // for (let i = 0; i < config.numEpochKeyNoncePerEpoch; i++) {
    //     const tmp = await getEpochKey(i, id, epoch);
    //     epks = [...epks, tmp];
    // }
    // console.log(epks)

    // return epks
    return ["5320b71c", "12345678"];
}

export const getAirdrop = async (identity: string, us: any) => {
    // let userState: any = us;
    // if (userState === null || userState === undefined) {
    //     const ret = await getUserState(identity);
    //     userState = ret.userState;
    // }
    // const unirepSocialContract = new UnirepSocialContract(config.UNIREP_SOCIAL, config.DEFAULT_ETH_PROVIDER);
    // const attesterId = await unirepSocialContract.attesterId();
    // let results: any;
    // try {
    //     results = await userState.genUserSignUpProof(BigInt(attesterId));
    //     console.log(results)
    //     console.log('---userState---');
    //     console.log(userState.toJSON());
    // } catch (e) {
    //     const ret = await getUserState(identity);
    //     userState = ret.userState;
    //     results = await userState.genUserSignUpProof(BigInt(attesterId));
    //     console.log(results)
    // }
    
    // const formattedProof = formatProofForVerifierContract(results.proof)
    // const encodedProof = base64url.encode(JSON.stringify(formattedProof))
    // const encodedPublicSignals = base64url.encode(JSON.stringify(results.publicSignals))
    // const signUpProof = config.signUpProofPrefix + encodedProof
    // const signUpPublicSignals = config.signUpPublicSignalsPrefix + encodedPublicSignals
    
    // const apiURL = makeURL('airdrop', {})
    // const data = {
    //     proof: signUpProof, 
    //     publicSignals: signUpPublicSignals,
    // }
    // const stringifiedData = JSON.stringify(data)
    // let transaction: string = ''
    // await fetch(apiURL, {
    //         headers: header,
    //         body: stringifiedData,
    //         method: 'POST',
    //     }).then(response => response.json())
    //     .then(function(data){
    //         console.log(JSON.stringify(data))
    //         transaction = data.transaction
    //     });

    // return { transaction, userState }

    return {transaction: "transaction", userState: null};
}

const genProof = async (identity: string, epkNonce: number = 0, proveKarmaAmount: number, minRep: number = 0, us: any, spent: number = -1) => {
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
    const proveGraffiti = BigInt(0);
    const graffitiPreImage = BigInt(0);
    const results = await userState.genProveReputationProof(BigInt(attesterId), epkNonce, minRep, proveGraffiti, graffitiPreImage, nonceList)
    console.log(results)

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
    // const apiURL = makeURL('genInvitationCode/' + invitationCode, {})
    // var ret = false
    // await fetch(apiURL)
    //     .then(response => ret = (response.ok === true));
    // return ret

    return true;
}

export const userSignUp = async () => {
    // const id = genIdentity()
    // const commitment = genIdentityCommitment(id)

    // const serializedIdentity = serialiseIdentity(id)
    // const encodedIdentity = base64url.encode(serializedIdentity)
    // console.log(config.identityPrefix + encodedIdentity)

    // const unirepSocialContract = new UnirepSocialContract(config.UNIREP_SOCIAL, config.DEFAULT_ETH_PROVIDER);
    // const currentEpoch = await unirepSocialContract.currentEpoch();
    // const epk1 = await getEpochKey(0, id, currentEpoch);

    // const serializedIdentityCommitment = commitment.toString(16)
    // const encodedIdentityCommitment = base64url.encode(serializedIdentityCommitment)
    // console.log(config.identityCommitmentPrefix + encodedIdentityCommitment)

    // // call server user sign up
    // let epoch: number = 0
    // const apiURL = makeURL('signup', {commitment: config.identityCommitmentPrefix + encodedIdentityCommitment, epk: epk1})
    // await fetch(apiURL)
    //     .then(response => response.json())
    //     .then(function(data){
    //         console.log(data)
    //         epoch = data.epoch
    //     });

    // return {i: config.identityPrefix + encodedIdentity, c: config.identityCommitmentPrefix + encodedIdentityCommitment, epoch }
    return {i: 'Unirep.identity.WyIxOGJkMjRjZmUxNzdlZTljODVmZmU3Y2U4NDc3NjkwZWE2NmRlNjBmNmM0OWE5M2VjYzc4Nzc3ODcxYWUxYjdiIiwiNTRkOTk1YTM2YTk0Mzc2OGM4ZTVkMGI3NzNmZjU5ZTIyOTU3ZmZmMzM5ZTJmNTdkM2Y3MzVjMWY3YTFhMjMiLCI4NDFiY2IyZTk3ZDQxYjE2NmVjNzFkNDJmZTViMmYyZGIyZDMzZmM0Y2EwNTFmYjQ3MTJkODgzYzMzNWQyZSJd', c: 'Unirep.identityCommitment.thisIsIdentityCommitment', epoch: 1};
}


export const publishPost = async (content: string, epkNonce: number, identity: string, minRep: number = 0, spent: number = 0, us: any) => {
    // const ret = await genProof(identity, epkNonce, config.DEFAULT_POST_KARMA, minRep, us, spent)

    // if (ret === undefined) {
    //     console.error('genProof error, ret is undefined.')
    // }

    //  // to backend: proof, publicSignals, content
    //  const apiURL = makeURL('post', {})
    //  const data = {
    //     content,
    //     proof: ret.proof, 
    //     minRep,
    //     publicSignals: ret.publicSignals,
    //  }
    //  const stringifiedData = JSON.stringify(data)
    //  console.log('before publish post api: ' + stringifiedData)
     
    //  let transaction: string = ''
    //  let postId: string = ''
    //  await fetch(apiURL, {
    //      headers: header,
    //      body: stringifiedData,
    //      method: 'POST',
    //  }).then(response => response.json())
    //     .then(function(data){
    //         console.log(JSON.stringify(data))
    //         transaction = data.transaction
    //         postId = data.postId
    //     });
    
    // return {transaction, postId, currentEpoch: ret.currentEpoch, epk: ret.epk, userState: ret.userState}
    return {transaction: "transaction", postId: 'post_id', currentEpoch: 1, epk: "5320b71c", userState: null};
}

export const vote = async(identity: string, upvote: number, downvote: number, postId: string, receiver: string, epkNonce: number = 0, minRep: number = 0, isPost: boolean = true, spent: number = 0, us: any) => {
    // // upvote / downvote user 
    // const voteValue = upvote + downvote
    // const ret = await genProof(identity, epkNonce, voteValue, minRep, us, spent)
    // if (ret === undefined) {
    //     console.error('genProof error, ret is undefined.')
    // }

    // // send publicsignals, proof, voted post id, receiver epoch key, graffiti to backend  
    // const apiURL = makeURL('vote', {})
    // const data = {
    //    upvote,
    //    downvote,
    //    proof: ret.proof, 
    //    minRep,
    //    publicSignals: ret.publicSignals,
    //    receiver,
    //    postId,
    //    isPost
    // }
    // const stringifiedData = JSON.stringify(data);
    // console.log('before vote api: ' + stringifiedData)
    
    // let transaction: string = ''
    // await fetch(apiURL, {
    //     headers: header,
    //     body: stringifiedData,
    //     method: 'POST',
    // }).then(response => response.json())
    //    .then(function(data){
    //        console.log(JSON.stringify(data))
    //        transaction = data.transaction
    //    });

    // return {epk: ret.epk, transaction, userState: ret.userState} 

    return {epk: "5320b71c", transaction: 'transaction', userState: null};
}

export const leaveComment = async(identity: string, content: string, postId: string, epkNonce: number = 0, minRep: number = 0, spent: number = 0, us: any) => {
    // const ret = await genProof(identity, epkNonce, config.DEFAULT_COMMENT_KARMA, minRep, us, spent)

    // if (ret === undefined) {
    //     console.error('genProof error, ret is undefined.')
    // }

    //  // to backend: proof, publicSignals, content
    //  const apiURL = makeURL('comment', {})
    //  const data = {
    //     content,
    //     proof: ret.proof, 
    //     minRep,
    //     postId,
    //     publicSignals: ret.publicSignals,
    //  }
    //  const stringifiedData = JSON.stringify(data)
    //  console.log('before leave comment api: ' + stringifiedData)
     
    //  let transaction: string = ''
    //  let commentId: string = ''
    //  await fetch(apiURL, {
    //      headers: header,
    //      body: stringifiedData,
    //      method: 'POST',
    //  }).then(response => response.json())
    //     .then(function(data){
    //         console.log(JSON.stringify(data))
    //         transaction = data.transaction
    //         commentId = data.commentId
    //     });
    
    // return {transaction, commentId, currentEpoch: ret.currentEpoch, epk: ret.epk, userState: ret.userState}
    return {transaction: 'transaction', commentId: 'commentId', currentEpoch: 1, epk: '5320b71c', userState: null};
}

export const getNextEpochTime = async () => {
    // const apiURL = makeURL('epochTransition', {})
    // var ret = 0
    // await fetch(apiURL)
    //     .then(response => response.json())
    //     .then(function(data){
    //         ret = data;
    //     });
    // console.log(ret);
    // return ret

    return 1640455581042;
}

export const userStateTransition = async (identity: string) => {
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
    // let epks: string[] = [];
    // for (var i = 1; i <= currentEpoch; i ++) {
    //     const epksRet = await getEpochKeys(identity, i);
    //     epks = [...epks, ...epksRet];
    // }

    // const paramStr = epks.join('_');
    // const apiURL = makeURL(`records/${paramStr}`, {});
    
    // let ret: History[] = [];
    // await fetch(apiURL).then(response => response.json()).then(
    //     (data) => {
    //         for (var i = 0; i < data.length; i ++) {
    //             const isVoter = epks.indexOf(data[i].from) !== -1;
    //             const history: History = {
    //                 action: data[i].action,
    //                 epoch_key: data[i].from,
    //                 upvote: isVoter? 0 : data[i].upvote,
    //                 downvote: isVoter? (data[i].upvote + data[i].downvote) : data[i].downvote,
    //                 epoch: data[i].epoch,
    //                 time: Date.parse(data[i].created_at),
    //                 data_id: data[i].data,
    //             }
    //             ret = [history, ...ret];
    //         }
    //     }
    // );
    // return ret;

    // airdrop
    const h1: History = {
        from: "UnirepSocial",
        to: "13832dc0",
        upvote: 30,
        downvote: 0,
        epoch: 0,
        action: ActionType.UST,
        data_id: "0",
        time: Date.parse("2021-11-09T18:35:18.984Z")
    };
    // other upvote me
    const h2: History = {
        from: "1f9cc994",
        to: "13832dc0",
        upvote: 6,
        downvote: 0,
        epoch: 0,
        action: ActionType.Vote,
        data_id: "618b95cb0eadf730d28d3b1b",
        time: Date.parse("2021-11-09T18:35:40.341Z")
    };
    // me post
    const h3: History = {
        from: "13832dc0",
        to: "13832dc0",
        upvote: 0,
        downvote: 5,
        epoch: 0,
        action: ActionType.Post,
        data_id: "618b95cb0eadf730d28d3b1b",
        time: Date.parse("2021-11-09T18:35:48.760Z")
    };
    // other downvote me
    const h4: History = {
        from: "1f9cc994",
        to: "13832dc0",
        upvote: 0,
        downvote: 2,
        epoch: 0,
        action: ActionType.Vote,
        data_id: "618b95cb0eadf730d28d3b1b",
        time: Date.parse("2021-11-09T18:35:40.341Z")
    };
    // me comment
    const h5: History = {
        from: "13832dc0",
        to: "13832dc0",
        upvote: 0,
        downvote: 3,
        epoch: 0,
        action: ActionType.Vote,
        data_id: "618b95cb0eadf730d28d3b1b",
        time: Date.parse("2021-11-09T18:35:40.341Z")
    };

    return [h1, h2, h3, h4, h5];
}

export const getEpochSpent = async (epks: string[]) => {
    // const paramStr = epks.join('_');
    // const apiURL = makeURL(`records/${paramStr}`, {spentonly: true});
    // console.log(apiURL);

    // let ret: number = 0;
    // await fetch(apiURL).then(response => response.json()).then(
    //     data => {
    //         console.log(data);
    //         for (var i = 0; i < data.length; i ++) {
    //             ret = ret + data[i].spent;
    //         }
    //     }
    // );

    // return ret;
    
    return 0;
}

const convertDataToVotes = (data: any, epks: string[]) => {
    let votes: Vote[] = [];
    let upvote: number = 0;
    let downvote: number = 0;
    let isUpvoted: boolean = false;
    let isDownvoted: boolean = false;
    for (var i = 0; i < data.length; i ++) {
        const posRep = Number(data[i].posRep);
        const negRep = Number(data[i].negRep);
        const vote: Vote = {
            upvote: posRep,
            downvote: negRep,
            epoch_key: data[i].voter,
        }
        if (epks.indexOf(vote.epoch_key) !== -1) {
            isUpvoted = vote.upvote !== 0;
            isDownvoted = vote.downvote !== 0;
        }
        upvote += posRep;
        downvote += negRep;
        votes = [...votes, vote];
    }

    return {votes, upvote, downvote, isUpvoted, isDownvoted};
}

const convertDataToPost = (data: any, epks: string[]) => {
    
    const {votes, upvote, downvote, isUpvoted, isDownvoted} = convertDataToVotes(data.votes, epks); 

    let comments: Comment[] = [];
    for (var i = 0; i < data.comments.length; i ++) {
        const votesRet= convertDataToVotes(data.comments[i].votes, epks);
        const comment = {
            type: DataType.Comment,
            id: data.comments[i]._id,
            post_id: data._id,
            content: data.comments[i].content,
            votes: votesRet.votes,
            upvote: votesRet.upvote,
            downvote: votesRet.downvote,
            isUpvoted: votesRet.isUpvoted,
            isDownvoted: votesRet.isDownvoted,
            epoch_key: data.comments[i].epochKey,
            username: '',
            post_time: Date.parse(data.comments[i].created_at),
            reputation: data.comments[i].minRep,
            isAuthor: epks.indexOf(data.comments[i].epochKey) !== -1,
            current_epoch: data.comments[i].epoch
        }
        comments = [...comments, comment];
    }
    

    const post: Post = {
        type: DataType.Post,
        id: data._id,
        title: data.title,
        content: data.content,
        votes,
        upvote,
        downvote,
        isUpvoted, 
        isDownvoted, 
        isAuthor: epks.indexOf(data.epochKey) !== -1,
        epoch_key: data.epochKey,
        username: '',
        post_time: Date.parse(data.created_at),
        reputation: data.minRep,
        comments,
        current_epoch: data.epoch,
    }

    return post;
}

// export const listAllPosts = async (epks: string[]) => {
//     const apiURL = makeURL(`post`, {});
    
//     let ret: Post[] = [];
//     await fetch(apiURL).then(response => response.json()).then(
//         data => {
//             console.log(data);
//             for (var i = 0; i < data.length; i ++) {
//                 const post = convertDataToPost(data[i], epks);
//                 ret = [...ret, post];
//             }
//         }
//     );

//     return ret;
// }

const v1: Vote = {
    upvote: 1,
    downvote: 0,
    epoch_key: "5320b71c"
};

const v2: Vote = {
    upvote: 6,
    downvote: 0,
    epoch_key: "1f9cc994"
};

const v3: Vote = {
    upvote: 0,
    downvote: 2,
    epoch_key: "ae0b8fc3"
};

const vc: Vote = {
    upvote: 1,
    downvote: 0,
    epoch_key: "ae0b8fc3"
};

const c1: Comment = {
    type: DataType.Comment,
    id: "618b95dd0eadf730d28d3b3a",
    post_id: "618b8f2c0eadf730d28d3ac1",
    content: "try comment",
    votes: [vc],
    upvote: 1,
    downvote: 0,
    isUpvoted: false,
    isDownvoted: false,
    epoch_key: "487a4930",
    username: '',
    post_time: 1636537821434,
    reputation: 3,
    isAuthor: false,
    current_epoch: 1
};

const c2: Comment = {
    type: DataType.Comment,
    id: "618b95dd0eadf730d28d3b3b",
    post_id: "618b8f2c0eadf730d28d3ac1",
    content: "try comment 222222222222222222222222222222222222222222222222222222222222222222222222",
    votes: [],
    upvote: 1,
    downvote: 0,
    isUpvoted: false,
    isDownvoted: false,
    epoch_key: "487a4930",
    username: '',
    post_time: 1636537821434,
    reputation: 4,
    isAuthor: false,
    current_epoch: 1
};

const p1: Post = {
    type: DataType.Post,
    id: "618b8f2c0eadf730d28d3ac1",
    title: 'p1 title is unknown',
    content: "Post 1, 123456789012345678 90123 456789012345 67890123456789 0123456789 012345  67890123 456789012345 678901 23456789012345 678901234 5678901234567 890123456 7890123 4567890123456789 01234567890123 456789 0123456 7890123456 78901234 5678901234 567890123456 78901234567 890",
    votes: [v1],
    upvote: 1,
    downvote: 0,
    isUpvoted: true, 
    isDownvoted: false, 
    isAuthor: false,
    epoch_key: "1f9cc994",
    username: '',
    post_time: 1636536108193,
    reputation: 5,
    comments: [c1, c2],
    current_epoch: 1
};

const p2: Post = {
    type: DataType.Post,
    id: "618b95cb0eadf730d28d3b1b",
    title: 'p2 title is also unknown',
    content: "Post 2: 我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得我覺得",
    votes: [v2, v3],
    upvote: 6,
    downvote: 2,
    isUpvoted: false, 
    isDownvoted: false, 
    isAuthor: true,
    epoch_key: "5320b71c",
    username: '',
    post_time: 1636537803800,
    reputation: 15,
    comments: [],
    current_epoch: 1
};

export const getPostById = async (epks: string[], postid: string) => {
    // const apiURL = makeURL(`post/${postid}`, {});
    // let ret: any;
    // await fetch(apiURL).then(response => response.json()).then(
    //     data => {
    //         console.log(data);
    //         ret = convertDataToPost(data, epks);
    //     }
    // );
    // return ret;

    if (postid === "618b8f2c0eadf730d28d3ac1") {
        return p1;
    } else if (postid === "618b95cb0eadf730d28d3b1b"){
        return p2;
    } else {
        return undefined;
    }
}

// export const getPostsByQuery = async (epks: string[], sort: string, maintype: string, subtype: string, start: number, end: number, lastRead: string = '0') => {
//     // const apiURL = makeURL(`post`, {sort, maintype, subtype, start, end, lastRead});
//     // console.log(apiURL);

//     // let ret: Post[] = [];
//     // await fetch(apiURL).then(response => response.json()).then(
//     //     data => {
//     //         console.log(data);
//     //         for (var i = 0; i < data.length; i ++) {
//     //             const post = convertDataToPost(data[i], epks);
//     //             ret = [...ret, post];
//     //         }
//     //     }
//     // );

//     // return ret;

//     return [p1, p2];
// }

export const getPostsByQuery = async () => {
    return [p1, p2];
}

export const sentReport = async (issue: string, email: string) => {
    // const apiURL = makeURL(`report`, {issue, email});
    
    // let ret: boolean = true;
    // await fetch(apiURL).then(response => ret = (response.ok === true));

    // return ret;

    return true;
}