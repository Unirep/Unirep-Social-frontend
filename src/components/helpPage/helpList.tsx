import { serialNumberTable } from './help';
import HelpTitle from './helpTitle';

type Props = {
    data: any,
    level: number,
}

const HelpList = ({ data, level }: Props) => {

    return (
        <div className={level === 1? 'help-list help-border' : 'help-list'}>
            { Object.keys(data).map(
                (key) => {
                    let title: string = '';
                    Object.entries(serialNumberTable).forEach(([k, v]) => {
                        if (k === key) {
                            title = v;
                        }
                    })

                    let d: any = {};
                    Object.entries(data).forEach(([k, v]) => {
                        if (k === key) {
                            d = v;
                        }
                    })
                    return <HelpTitle title={title} data={d} level={level+1} key={key}/>;
                }
            )}
        </div>
    );
}

export default HelpList;