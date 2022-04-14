import { createContext } from 'react'
import { Page, Draft } from '../constants'

type GlobalContent = {
    isMenuOpen: boolean
    setIsMenuOpen: (value: boolean) => void
    page: Page
    setPage: (value: Page) => void
    adminCode: string
    setAdminCode: (value: string) => void
    draft: null | Draft
    setDraft: (value: any) => void
}

export const WebContext = createContext<GlobalContent>({
    isMenuOpen: false,
    setIsMenuOpen: () => {},
    page: Page.Home,
    setPage: () => {},
    adminCode: '',
    setAdminCode: () => {},
    draft: null,
    setDraft: () => {},
})
