import React from 'react';
// API
import {getMissionsForSpacecraft, getTargetsForSpacecraft, getInstrumentsForSpacecraft} from 'api/spacecraft.js'
import {getSpacecraftForTarget} from 'api/target'
// GUI Components
import ListBox from 'components/ListBox'
import {DatasetList} from 'components/Dataset'
import {Header, Description} from 'components/ContextObjects'

export default class Spacecraft extends React.Component {
    constructor(props) {
        super(props)
        const spacecraft = props.spacecraft
        this.state = {
            spacecraft: spacecraft,
            loaded: false,
        }
    }

    componentDidMount() {
        getMissionsForSpacecraft(this.state.spacecraft).then(missions => {
            console.log(missions)
        })
        getTargetsForSpacecraft(this.state.spacecraft).then(targets => {
            console.log(targets)
        })
        getInstrumentsForSpacecraft(this.state.spacecraft).then(instruments => {
            console.log(instruments)
        })
    }

    render() {
        const {spacecraft} = this.state
        return (
            <div>
                <Header model={spacecraft} />
                <Description model={spacecraft} />
                <main className="co-main target-main">
                    <DatasetList model={spacecraft} />
                </main>
            </div>
        )
    }
}

class SpacecraftList extends React.Component {
    constructor(props) {
        super(props)
        const target = props.model
        this.state = {
            target: target,
            spacecraft: [],
            elements: [],
            loaded: false
        }
    }
    
    componentDidMount() {
        let self = this;
        getSpacecraftForTarget(this.state.target).then(function(vals) {
            self.setState({
                spacecraft: vals
            })
        })
    }
    
    render() {
        let self = this
        const {spacecraft} = self.state
        let arr = Array.from(spacecraft)
        
        for (const [idx,val] of arr.entries()) {
            const lid = val.identifier
            const link = `/?spacecraft=${lid}`
            
            self.state.elements.push(<li key={val.title}><a href={link}>{ val.title }</a></li>);
        };
        
        return (
            <section className="co-section target-spacecraft">
                <h2>Spacecraft</h2>
                <ListBox itemList={self.state.elements} />
            </section>
        )
    }
}

export {Spacecraft,SpacecraftList}