import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'

import { Post } from '../constants'
import { makeURL, convertDataToPost } from '../utils'
import UserContext, { User } from './User'
import QueueContext, { Queue } from './Queue'

const queueContext = (QueueContext as any)._currentValue as Queue
const userContext = (UserContext as any)._currentValue as User

export class Data {
    postsById = {} as { [id: string]: Post }
    feedsByQuery = {} as { [query: string]: string[] }
    header = {
        'content-type': 'application/json',
        // 'Access-Control-Allow-Origin': config.SERVER,
        // 'Access-Control-Allow-Credentials': 'true',
    }

    constructor() {
        makeAutoObservable(this)
    }

    // must be called in browser, not in SSR
    load() {}

    private ingestPosts(_posts: Post | Post[]) {
        const posts = [_posts].flat()
        for (const post of posts) {
            this.postsById[post.id] = post
        }
    }

    async loadPost(id: string) {
        const apiURL = makeURL(`post/${id}`, {})
        const r = await fetch(apiURL)
        const data = await r.json()
        const post = convertDataToPost(data[0], false)
        this.ingestPosts(post)
    }

    async loadFeed(query: string, lastRead = '0', epks = [] as string[]) {
        const apiURL = makeURL(`post`, {
            query,
            lastRead,
            epks: epks.join('_'),
        })
        const r = await fetch(apiURL)
        const data = await r.json()
        const posts = data.map((p: any) => convertDataToPost(p)) as Post[]
        this.ingestPosts(posts)
        if (!this.feedsByQuery[query]) {
            this.feedsByQuery[query] = []
        }
        const ids = {} as { [key: string]: boolean }
        const postIds = posts.map((p) => p.id)
        this.feedsByQuery[query] = [
            ...postIds,
            ...this.feedsByQuery[query],
        ].filter((id) => {
            if (ids[id]) return false
            ids[id] = true
            return true
        })
    }

    getAirdrop() {
        queueContext.addOp(async (update) => {
            if (!userContext.userState) return false

            update({
                title: 'Waiting to generate Airdrop',
                details: 'Synchronizing with blockchain...',
            })

            console.log('before userContext wait for sync')
            await userContext.waitForSync()
            console.log('sync complete')

            await userContext.calculateAllEpks()
            await userContext.loadSpent()
            update({
                title: 'Creating Airdrop',
                details: 'Generating ZK proof...',
            })

            const { transaction, error } = await userContext.getAirdrop()
            if (error) throw error

            update({
                title: 'Creating Airdrop',
                details: 'Waiting for TX inclusion...',
            })
            await queueContext.afterTx(transaction)
        })

        return true
    }

    publishPost(
        title: string = '',
        content: string = '',
        epkNonce: number = 0,
        proveKarma: number = 5
    ) {
        const user = (UserContext as any)._currentValue

        queueContext.addOp(
            async (updateStatus) => {
                updateStatus({
                    title: 'Creating post',
                    details: 'Generating zk proof...',
                })
                const { proof, publicSignals } = await user.genRepProof(
                    proveKarma,
                    epkNonce
                )
                updateStatus({
                    title: 'Creating post',
                    details: 'Waiting for TX inclusion...',
                })
                const apiURL = makeURL('post', {})
                const r = await fetch(apiURL, {
                    headers: this.header,
                    body: JSON.stringify({
                        title,
                        content,
                        proof,
                        proveKarma,
                        publicSignals,
                    }),
                    method: 'POST',
                })
                const { transaction, error } = await r.json()
                if (error) throw error
                await queueContext.afterTx(transaction)
            },
            {
                successMessage: 'Post is finalized',
            }
        )
    }

    vote(
        postId: string = '',
        commentId: string = '',
        receiver: string,
        epkNonce: number = 0,
        upvote: number = 0,
        downvote: number = 0
    ) {
        queueContext.addOp(async (updateStatus) => {
            updateStatus({
                title: 'Creating Vote',
                details: 'Generating ZK proof...',
            })
            const { proof, publicSignals } = await userContext.genRepProof(
                upvote + downvote,
                epkNonce
            )
            updateStatus({
                title: 'Creating Vote',
                details: 'Broadcasting vote...',
            })
            const r = await fetch(makeURL('vote'), {
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    upvote,
                    downvote,
                    proof,
                    minRep: upvote + downvote,
                    publicSignals,
                    receiver,
                    dataId: postId.length > 0 ? postId : commentId,
                    isPost: !!postId,
                }),
                method: 'POST',
            })
            const { error, transaction } = await r.json()
            if (error) throw error
            updateStatus({
                title: 'Creating Vote',
                details: 'Waiting for transaction...',
            })
            await queueContext.afterTx(transaction)
        })
    }

    leaveComment(
        content: string,
        postId: string,
        epkNonce: number = 0,
        proveKarma: number = 3
    ) {
        queueContext.addOp(
            async (updateStatus) => {
                updateStatus({
                    title: 'Creating comment',
                    details: 'Generating ZK proof...',
                })
                const { proof, publicSignals } = await userContext.genRepProof(
                    proveKarma,
                    epkNonce
                )
                updateStatus({
                    title: 'Creating comment',
                    details: 'Waiting for transaction...',
                })
                const r = await fetch(makeURL('comment'), {
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        content,
                        proof,
                        minRep: proveKarma,
                        postId,
                        publicSignals,
                    }),
                    method: 'POST',
                })
                const { transaction, error } = await r.json()
                if (error) throw error
                await queueContext.afterTx(transaction)
            },
            {
                successMessage: 'Comment is finalized!',
            }
        )
    }
}

export default createContext(new Data())
