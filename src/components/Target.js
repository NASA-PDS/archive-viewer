import React from 'react';
import 'css/ContextObjects.scss'
import {getDatasetsForTarget, getSpacecraftForTarget, getRelatedTargetsForTarget} from 'api/target'
import {Header, Description} from 'components/ContextObjects'
import {DatasetListBox,SpacecraftListBox} from 'components/ListBox'
import Loading from 'components/Loading'

export default class Target extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            target: props.target,
            datasets: props.datasets,
            spacecraft: props.spacecraft,
            loaded: false,
        }
    }
    
    componentDidMount() {
        getDatasetsForTarget(this.state.target).then(datasets => this.setState({datasets}))
        getSpacecraftForTarget(this.state.target).then(spacecraft => this.setState({spacecraft}))
        getRelatedTargetsForTarget(this.state.target).then(console.log)
    }

    render() {
        const {target,datasets,spacecraft} = this.state
        if (!target || !datasets || !spacecraft) return <Loading />
        else return (
            <div>
                <Header model={target} />
                <main className="co-main target-main">
                    <div>
                        <Description model={target} />
                    </div>
                    <DatasetListBox items={datasets} groupBy="spacecraft" groupInfo={spacecraft}/>
                    <SpacecraftListBox items={spacecraft} />
                </main>
            </div>
        )
    }
}
