import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'

import { Post } from '../constants'
import { makeURL, convertDataToPost } from '../utils'

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

    async publishPost(title: string = '', content: string = '', minRep: number = 0, proof: any = undefined, publicSignals: any = undefined) {
        if (!proof || !publicSignals) return undefined

        const apiURL = makeURL('post', {})
        const r = await fetch(apiURL, {
            headers: this.header,
            body: JSON.stringify({
                title,
                content,
                proof,
                minRep,
                publicSignals,
            }),
            method: 'POST',
        })
        const { transaction, error } = await r.json()
        return {
            error,
            transaction
        }
    }
}

export default createContext(new Data())
