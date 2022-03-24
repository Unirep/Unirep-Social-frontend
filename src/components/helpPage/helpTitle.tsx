import { useState } from 'react'
import HelpList from './helpList'

type Props = {
    title: string
    data: any
    level: number
}

const HelpTitle = ({ title, data, level }: Props) => {
    const [isActive, setIsActive] = useState<boolean>(false)

    const preventPropagation = (event: any) => {
        event.stopPropagation()
    }

    const switchActive = (event: any) => {
        preventPropagation(event)
        console.log(level)
        console.log(data)
        setIsActive(!isActive)
    }

    return (
        <div className="help-item">
            <div className="help-title" onClick={switchActive}>
                {title}
                <img
                    src={require(`../../../public/images/arrow-${
                        isActive ? 'up' : 'down'
                    }.png`)}
                />
            </div>
            {isActive ? (
                level === 4 ? (
                    <div className="help-content">{data}</div>
                ) : (
                    <HelpList data={data} level={level} key={level} />
                )
            ) : (
                <div></div>
            )}
        </div>
    )
}

export default HelpTitle
