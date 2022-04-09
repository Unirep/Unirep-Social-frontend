import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'

import Queue from './Queue'
import UserContext from './User'

import { Post } from '../constants'
import {
    makeURL,
    convertDataToPost,
    publishPost,
    vote,
    leaveComment,
} from '../utils'

export class Data {
    postsById = {} as { [id: string]: Post }
    feedsByQuery = {} as { [query: string]: Post[] }
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
        console.log('loadfeed: ' + query)
        const apiURL = makeURL(`post`, {
            query,
            lastRead,
            epks: epks.join('_'),
        })
        const r = await fetch(apiURL)
        const data = await r.json()
        const posts = data.map((p: any) => convertDataToPost(p)) as Post[]
        console.log(posts)
        this.ingestPosts(posts)
        if (!this.feedsByQuery[query]) {
            this.feedsByQuery[query] = []
        }
        const ids = {} as { [key: string]: boolean }
        this.feedsByQuery[query] = [
            ...posts,
            ...this.feedsByQuery[query],
        ].filter((p) => {
            if (ids[p.id]) return false
            ids[p.id] = true
            return true
        })
    }

    publishPost(
        title: string = '',
        content: string = '',
        epkNonce: number = 0,
        minRep: number = 5
    ) {
        const user = (UserContext as any)._currentValue
        const queue = (Queue as any)._currentValue

        queue.addOp(
            async (updateStatus: any) => {
                updateStatus({
                    title: 'Creating post',
                    details: 'Generating zk proof...',
                })
                const proofData = await user.genRepProof(5, minRep, epkNonce)
                updateStatus({
                    title: 'Creating post',
                    details: 'Waiting for TX inclusion...',
                })
                const { transaction } = await publishPost(
                    proofData,
                    minRep,
                    content,
                    title
                )
                await queue.afterTx(transaction)
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
        const user = (UserContext as any)._currentValue
        const queue = (Queue as any)._currentValue

        queue.addOp(async (updateStatus: any) => {
            updateStatus({
                title: 'Creating Vote',
                details: 'Generating ZK proof...',
            })
            const proofData = await user.genRepProof(
                upvote + downvote,
                upvote + downvote,
                epkNonce
            )
            updateStatus({
                title: 'Creating Vote',
                details: 'Broadcasting vote...',
            })
            const { transaction } = await vote(
                proofData,
                upvote + downvote,
                upvote,
                downvote,
                postId.length > 0 ? postId : commentId,
                receiver,
                postId.length > 0
            )
            updateStatus({
                title: 'Creating Vote',
                details: 'Waiting for transaction...',
            })
            await queue.afterTx(transaction)
        })
    }

    leaveComment(
        content: string,
        postId: string,
        epkNonce: number = 0,
        minRep: number = 3
    ) {
        const user = (UserContext as any)._currentValue
        const queue = (Queue as any)._currentValue

        queue.addOp(
            async (updateStatus: any) => {
                updateStatus({
                    title: 'Creating comment',
                    details: 'Generating ZK proof...',
                })
                const proofData = await user.genRepProof(3, minRep, epkNonce)
                updateStatus({
                    title: 'Creating comment',
                    details: 'Waiting for transaction...',
                })
                const { transaction } = await leaveComment(
                    proofData,
                    minRep,
                    content,
                    postId
                )
                await queue.afterTx(transaction)
            },
            {
                successMessage: 'Comment is finalized!',
            }
        )
    }
}

export default createContext(new Data())
