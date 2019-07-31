import React from 'react';
import {SpacecraftList} from 'components/Spacecraft'
import {DatasetList} from 'components/Dataset'
import {Header, Description} from 'components/ContextObjects'
import 'components/Target.scss';

export default class Target extends React.Component {
    constructor(props) {
        super(props)
        const target = props.target
        this.state = {
            target: target,
            loaded: false,
        }
    }

    render() {
        const {target} = this.state
        return (
            <div>
                <Header model={target} />
                <Description model={target} />
                <main className="co-main target-main">
                    <DatasetList model={target} />
                    <SpacecraftList model={target} />
                </main>
            </div>
        )
    }
}