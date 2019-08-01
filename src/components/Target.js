import React from 'react';
import {getDatasetsForTarget, getSpacecraftForTarget} from 'api/target'
import {Header, Description} from 'components/ContextObjects'
import {DatasetListBox,ShowSpacecraftListBox} from 'components/ListBox'

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
    }

    render() {
        const {target,datasets,spacecraft} = this.state
        if (!this.state.datasets) {return null}
        else return (
            <div>
                <Header model={target} />
                <main className="co-main target-main">
                    <div>
                        <Description model={target} />
                    </div>
                    <DatasetListBox items={datasets} />
                </main>
            </div>
        )
    }
}
// { ShowSpacecraftListBox( spacecraft, 'spacecraft' ) }
