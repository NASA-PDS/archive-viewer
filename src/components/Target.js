import React from 'react';
import {getDatasetsForTarget, getSpacecraftForTarget} from 'api/target'
import {Header, Description} from 'components/ContextObjects'
import ShowListBox from 'components/ListBox'
import 'components/Target.scss';

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
        return (
            <div>
                <Header model={target} />
                <Description model={target} />
                <main className="co-main target-main">
                    { ShowListBox( datasets, 'Datasets' ) }
                    { ShowListBox( spacecraft, 'Spacecraft' ) }
                </main>
            </div>
        )
    }
}