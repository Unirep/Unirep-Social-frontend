import { useContext } from 'react'

import './basicPage.scss'
import { WebContext } from '../../context/WebContext'

import Banner from '../banner/banner'
import SideColumn from '../sideColumn/sideColumn'
import LoadingWidget from '../loadingWidget/loadingWidget'
import Overlay from '../overlay/overlay'

type Props = {
    children: any
}

const BasicPage = ({ children }: Props) => {
    const { isMenuOpen } = useContext(WebContext)

    return (
        <div className="body-columns">
            <div className="margin-box"></div>
            <div className="content">
                <Banner />
                <div className="main-content">{children}</div>
                <div className="side-content">
                    <SideColumn />
                </div>
            </div>
            <div className="margin-box"></div>

            <LoadingWidget />

            {isMenuOpen ? <Overlay /> : <div></div>}
        </div>
    )
}

export default BasicPage
