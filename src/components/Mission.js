import React from 'react';
import {getSpacecraftForMission, getTargetsForMission} from 'api/mission.js'
import {Header, Description} from 'components/ContextObjects'
import ListBox from 'components/ListBox'

export default class Mission extends React.Component {
    constructor(props) {
        super(props)
        const mission = props.mission
        this.state = {
            mission: mission,
            loaded: false,
        }
    }

    componentDidMount() {
        getSpacecraftForMission(this.state.mission).then(spacecraft => {
            console.log(spacecraft)
        })
        getTargetsForMission(this.state.mission).then(targets => {
            console.log(targets)
        })
    }

    render() {
        const {mission} = this.state
        return (
            <div>
                <Header model={mission} />
                <Description model={mission} />

            </div>
        )
    }
}

class MissionList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            missions: props.missions,
            elements: [],
            loaded: false
        }
    }
    
    render() {
        let self = this
        const {missions} = self.state
        self.state.elements = [];
        let arr = Array.from(missions)
        
        for (const [idx,val] of arr.entries()) {
            const lid = val.identifier
            const link = `/?mission=${lid}`
        
            self.state.elements.push(<li key={val.title}><a href={link}>{ val.title }</a></li>)
        }
        
        return (
            <section className="co-section mission-list">
                <h2>Missions</h2>
                <ListBox itemList={self.state.elements} />
            </section>
        )
    }
}

export {Mission, MissionList}