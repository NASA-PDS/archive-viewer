import React from 'react';
import {getSpacecraftForTarget, getDatasetsForTarget} from 'api/target.js'
import {SpacecraftList} from 'components/Spacecraft'
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
                <Main model={target} className="target-root" />
            </div>
        )
    }
}

class Main extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            loaded: false
        }
    }
    
    render() {
        const {target} = this.state
        return (
            <main className="co-main target-main">
                <Description model={target} />
                <DatasetList model={target} />
                <Aside model={target} />
            </main>
        )
    }
}

class DatasetList extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            datasets: [],
            elements: [],
            loaded: false
        }
    }
    
    componentDidMount() {
        let self = this;
        getDatasetsForTarget(this.state.target).then(function(vals) {
            self.setState({
                datasets: vals
            })
        })
    }
    
    sortBy() {
        return {
            mission: function(datasets) {
                // takes an array of datasets and
                    // returns an object containing mission names
                    // and a list of associated datasets
                
                let missions = {}
                
                datasets.map((dataset, idx) => {
                    const mission = dataset['investigation_name']
                    
                    if (!missions[mission]) missions[mission] = [dataset]
                    else missions[mission].push(dataset)
                })
                
                return missions
            }
        }
    }
    
    render() {
        let self = this
        const {datasets} = this.state
        let arr = Array.from(datasets)
        
        // TODO: Apply various sorting methods
        const datasetsByMission = self.sortBy().mission(datasets)
        
        for (const [idx,val] of arr.entries()) {
            const el = (
                <li key={val.title}>{ val.title }</li>
            )
            self.state.elements.push(el)
        } 
        
        return (
            <section className="co-section target-datasets">
                <h2>Datasets</h2>
                <ListBox itemList={self.state.elements} />
            </section>
        )
    }
}

class Aside extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            loaded: false
        }
    }
    
    render() {
        const {target} = this.state
        
        return (
            <aside className="co-aside target-aside">
                <SpacecraftList model={target} />
            </aside>
        )
    }
}