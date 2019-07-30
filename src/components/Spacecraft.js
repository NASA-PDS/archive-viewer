import React from 'react';
import {getMissionsForSpacecraft, getTargetsForSpacecraft, getInstrumentsForSpacecraft, getDatasetsForSpacecraft} from 'api/spacecraft.js'
import {getSpacecraftForTarget} from 'api/target'
import {Header, Description} from 'components/ContextObjects'
import ListBox from 'components/ListBox'

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
        getDatasetsForSpacecraft(this.state.spacecraft).then(datasets => {
            console.log(datasets)
        })
    }

    render() {
        const {spacecraft} = this.state
        return (
            <div>
                <Header model={spacecraft} />
                <Description model={spacecraft} />
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
            const el = <li key={val.title}>{ val.title }</li>;
            
            self.state.elements.push(el);
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