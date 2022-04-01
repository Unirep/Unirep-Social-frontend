import { createContext } from 'react'
import { Post, User, Page, Draft } from '../constants'

type GlobalContent = {
    user: User | null
    setUser: (u: User | null) => void
    tx: string
    setTx: (t: string) => void
    shownPosts: Post[]
    setShownPosts: (posts: Post[]) => void
    isLoading: boolean
    setIsLoading: (value: boolean) => void
    isMenuOpen: boolean
    setIsMenuOpen: (value: boolean) => void
    page: Page
    setPage: (value: Page) => void
    action: any
    setAction: (value: any) => void
    adminCode: string
    setAdminCode: (value: string) => void
    draft: null | Draft
    setDraft: (value: any) => void
}

export const WebContext = createContext<GlobalContent>({
    user: null,
    setUser: () => {},
    tx: '',
    setTx: () => {},
    shownPosts: [],
    setShownPosts: () => {},
    isLoading: false,
    setIsLoading: () => {},
    isMenuOpen: false,
    setIsMenuOpen: () => {},
    page: Page.Home,
    setPage: () => {},
    action: null,
    setAction: () => {},
    adminCode: '',
    setAdminCode: () => {},
    draft: null,
    setDraft: () => {},
})
