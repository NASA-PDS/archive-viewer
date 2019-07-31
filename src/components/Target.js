import React from 'react';
import {SpacecraftList} from 'components/Spacecraft'
import {DatasetList} from 'components/Dataset'
import {Header, Description} from 'components/ContextObjects'
import ListBox from 'components/ListBox'
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

class TargetList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            targets: props.targets,
            elements: [],
            loaded: false
        }
    }
    
    render() {
        let self = this
        const {targets} = self.state
        self.state.elements = []
        let arr = Array.from(targets)
        
        for (const [idx,val] of arr.entries()) {
            const lid = val.identifier
            const link = `/?target=${lid}`
            
            self.state.elements.push(<li key={val.title}><a href={link}>{val.title}</a></li>)
        }
        
        return (
            <section className="co-section target-list">
                <h2>Targets</h2>
                <ListBox itemList={self.state.elements} />
            </section>
        )
    }
}

export {Target, TargetList}