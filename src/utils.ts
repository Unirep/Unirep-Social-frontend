import {
    genIdentity,
    genIdentityCommitment,
    serialiseIdentity,
    unSerialiseIdentity,
} from '@unirep/crypto'
import { genEpochKey } from '@unirep/unirep'
import * as config from './config'
import {
    Record,
    Post,
    DataType,
    Vote,
    Comment,
    ActionType,
    QueryType,
} from './constants'
import UnirepContext from './context/Unirep'

const decodeIdentity = (identity: string) => {
    try {
        const id = unSerialiseIdentity(identity)
        const commitment = genIdentityCommitment(id)
        return { id, commitment, identityNullifier: id.identityNullifier }
    } catch (e) {
        console.log('Incorrect Identity format\n', e)
        return {
            id: BigInt(0),
            commitment: BigInt(0),
            identityNullifier: BigInt(0),
        }
    }
}

const getEpochKey = (
    epkNonce: number,
    identityNullifier: any,
    epoch: number
) => {
    const unirepConfig = (UnirepContext as any)._currentValue
    if (!unirepConfig.loaded) throw new Error('Unirep config not loaded')
    const epochKey = genEpochKey(
        identityNullifier,
        epoch,
        epkNonce,
        unirepConfig.epochTreeDepth
    )

    return epochKey.toString(16)
}

const getEpochKeys = (identity: string, epoch: number) => {
    const unirepConfig = (UnirepContext as any)._currentValue
    if (!unirepConfig.loaded) throw new Error('Unirep config not loaded')
    const { identityNullifier } = decodeIdentity(identity)
    const epks: string[] = []
    for (let i = 0; i < unirepConfig.numEpochKeyNoncePerEpoch; i++) {
        const tmp = getEpochKey(i, identityNullifier, epoch)
        epks.push(tmp)
    }
    return epks
}

export const makeURL = (action: string, data: any = {}) => {
    const params = new URLSearchParams(data)
    return `${config.SERVER}/api/${action}?${params}`
}

const header = {
    'content-type': 'application/json',
    // 'Access-Control-Allow-Origin': config.SERVER,
    // 'Access-Control-Allow-Credentials': 'true',
}

export const checkInvitationCode = async (invitationCode: string) => {
    const apiURL = makeURL('genInvitationCode/' + invitationCode, {})
    const r = await fetch(apiURL)
    return r.ok
}

export const userSignUp = async () => {
    const unirepConfig = (UnirepContext as any)._currentValue
    await unirepConfig.loadingPromise
    const id = genIdentity()
    const commitment = genIdentityCommitment(id).toString(16).padStart(64, '0')

    const serializedIdentity = serialiseIdentity(id)

    const currentEpoch = Number(await unirepConfig.currentEpoch())
    const epk1 = getEpochKey(0, id.identityNullifier, currentEpoch)

    // call server user sign up
    const apiURL = makeURL('signup', {
        commitment: commitment,
        epk: epk1,
    })
    const r = await fetch(apiURL)
    const { epoch } = await r.json()
    return {
        i: serializedIdentity,
        c: commitment,
        epoch,
    }
}

export const publishPost = async (
    proofData: any,
    minRep: number,
    content: string,
    title: string = ''
) => {
    const unirepConfig = (UnirepContext as any)._currentValue
    await unirepConfig.loadingPromise

    // to backend: proof, publicSignals, content
    const apiURL = makeURL('post', {})
    const r = await fetch(apiURL, {
        headers: header,
        body: JSON.stringify({
            title,
            content,
            proof: proofData.proof,
            minRep,
            publicSignals: proofData.publicSignals,
        }),
        method: 'POST',
    })
    return r.json()
}

export const vote = async (
    proofData: any,
    minRep: number,
    upvote: number,
    downvote: number,
    dataId: string,
    receiver: string,
    isPost: boolean = true
) => {
    // send publicsignals, proof, voted post id, receiver epoch key, graffiti to backend
    const apiURL = makeURL('vote', {})
    const data = {
        upvote,
        downvote,
        proof: proofData.proof,
        minRep,
        publicSignals: proofData.publicSignals,
        receiver,
        dataId,
        isPost,
    }
    const stringifiedData = JSON.stringify(data)
    console.log('before vote api: ' + stringifiedData)

    const r = await fetch(apiURL, {
        headers: header,
        body: stringifiedData,
        method: 'POST',
    })
    const { error, transaction } = await r.json()
    return { error, transaction }
}

export const leaveComment = async (
    proofData: any,
    minRep: number,
    content: string,
    postId: string
) => {
    const unirepConfig = (UnirepContext as any)._currentValue
    await unirepConfig.loadingPromise

    // to backend: proof, publicSignals, content
    const apiURL = makeURL('comment', {})
    const data = {
        content,
        proof: proofData.proof,
        minRep,
        postId,
        publicSignals: proofData.publicSignals,
    }
    const stringifiedData = JSON.stringify(data)
    console.log('before leave comment api: ' + stringifiedData)

    const r = await fetch(apiURL, {
        headers: header,
        body: stringifiedData,
        method: 'POST',
    })
    return r.json()
}

export const getRecords = async (currentEpoch: number, identity: string) => {
    const unirepConfig = (UnirepContext as any)._currentValue
    await unirepConfig.loadingPromise
    const { commitment } = decodeIdentity(identity)
    const epks: string[] = []
    for (let i = 1; i <= currentEpoch; i++) {
        const epksRet = getEpochKeys(identity, i)
        epks.push(...epksRet)
    }

    const commitmentAPIURL = makeURL(`records`, { commitment })
    const paramStr = epks.join('_')
    const apiURL = makeURL(`records/${paramStr}`, {})
    console.log(apiURL)

    const getCommitment = fetch(commitmentAPIURL)
        .then((response) => response.json())
        .then((data) => {
            if (data.length === 0) return
            const signupRecord: Record = {
                action: ActionType.Signup,
                from: 'SignUp Airdrop',
                to: data[0].to,
                upvote: unirepConfig.airdroppedReputation,
                downvote: 0,
                epoch: data[0].epoch,
                time: Date.parse(data[0].created_at),
                data_id: '',
                content: '',
            }
            return signupRecord
        }) as Promise<Record>

    const getGeneralRecords = fetch(apiURL)
        .then((response) => response.json())
        .then((data) => {
            const records: Record[] = []
            for (let i = 0; i < data.length; i++) {
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
                records.unshift(record)
            }
            return records
        }) as Promise<Record[]>

    const allRecords = await Promise.all([getCommitment, getGeneralRecords])

    return allRecords.flat()
}

const convertDataToVotes = (data: any) => {
    if (data === null || data === undefined || !data.length)
        return { votes: [], upvote: 0, downvote: 0 }
    const votes: Vote[] = []
    let upvote: number = 0
    let downvote: number = 0
    for (let i = 0; i < data.length; i++) {
        const posRep = Number(data[i].posRep)
        const negRep = Number(data[i].negRep)
        const vote: Vote = {
            upvote: posRep,
            downvote: negRep,
            epoch_key: data[i].voter,
        }
        upvote += posRep
        downvote += negRep
        votes.push(vote)
    }

    return { votes, upvote, downvote }
}

const convertDataToComment = (data: any) => {
    const { votes, upvote, downvote } = convertDataToVotes(data.votes)
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

    return comment
}

export const convertDataToPost = (
    data: any,
    commentsOnlyId: boolean = true
) => {
    const { votes, upvote, downvote } = convertDataToVotes(data.votes)

    const comments: Comment[] = []
    if (!commentsOnlyId) {
        for (let i = 0; i < data.comments.length; i++) {
            const comment = convertDataToComment(data.comments[i])
            comments.push(comment)
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
        commentsCount: data.comments ? data.comments.length : 0,
        current_epoch: data.epoch,
        proofIndex: data.proofIndex,
    }

    return post
}

export const listAllPosts = async () => {
    const apiURL = makeURL(`post`, {})

    const r = await fetch(apiURL)
    const data = await r.json()
    return data.map((p: any) => convertDataToPost(p)) as Post[]
}

export const getPostById = async (postid: string) => {
    const apiURL = makeURL(`post/${postid}`, {})
    const r = await fetch(apiURL)
    const data = await r.json()
    return convertDataToPost(data, false)
}

export const getPostsByQuery = async (
    query: QueryType,
    lastRead: string = '0',
    epks: string[] = []
) => {
    const apiURL = makeURL(`post`, { query, lastRead, epks: epks.join('_') })
    console.log(apiURL)

    const r = await fetch(apiURL)
    const data = await r.json()
    return data.map((p: any) => convertDataToPost(p)) as Post[]
}

export const getCommentsByQuery = async (
    query: QueryType,
    lastRead: string = '0',
    epks: string[] = []
) => {
    const apiURL = makeURL(`comment`, { query, lastRead, epks: epks.join('_') })
    console.log(apiURL)
    const r = await fetch(apiURL)
    const data = await r.json()
    return data.map((c: any) => convertDataToComment(c)) as Comment[]
}

export const sentReport = async (issue: string, email: string) => {
    const apiURL = makeURL(`report`, { issue, email })
    const r = await fetch(apiURL)
    return r.ok
}

//////////////////////////////// Admin related //////////////////////////////////
export const checkIsAdminCodeValid = async (code: string) => {
    const apiURL = makeURL('admin', { code })
    const r = await fetch(apiURL)
    return r.ok
}

export const adminLogin = async (id: string, password: string) => {
    const apiURL = makeURL('admin', { id, password })
    const r = await fetch(apiURL)
    if (!r.ok) return ''
    return r.json()
}

export const genInvitationCode = async (code: string) => {
    const apiURL = makeURL('genInvitationCode', { code })
    const r = await fetch(apiURL)
    if (!r.ok) return ''
    return r.json()
}

export const getLatestBlock = async () => {
    const apiURL = makeURL('block')
    const r = await fetch(apiURL)
    if (!r.ok) return ''
    const data = await r.json()
    return data.blockNumber
}
