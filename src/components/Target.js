import React from 'react';
import 'css/ContextObjects.scss'
import {getDatasetsForTarget, getSpacecraftForTarget, getRelatedTargetsForTarget} from 'api/target'
import {Header, Description} from 'components/ContextObjects'
import ListBox from 'components/ListBox'
import Loading from 'components/Loading'

export default class Target extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            target: props.target,
            relatedTargets: null,
            datasets: null,
            spacecraft: null,
            loaded: false,
        }
    }
    
    componentDidMount() {
        getDatasetsForTarget(this.state.target).then(datasets => this.setState({datasets}), er => console.log(er))
        getSpacecraftForTarget(this.state.target).then(spacecraft => this.setState({spacecraft}), er => console.log(er))
        getRelatedTargetsForTarget(this.state.target).then(relatedTargets => this.setState({relatedTargets}), er => console.log(er))
    }

    render() {
        const {target,relatedTargets,datasets,spacecraft} = this.state
        if (!target ) return <Loading fullscreen={true} />
        else return (
            <div className="co-main">
                <Header model={target} type={Header.type.target} />
                <aside className="main-aside sidebox">
                    <ListBox type="spacecraft"     items={spacecraft} />
                    <ListBox type="relatedTarget"  items={relatedTargets} />
                </aside>
                <Description model={target} type={Description.type.target} />
                <ListBox type="dataset" items={datasets} groupBy="spacecraft" groupInfo={spacecraft}/>
            </div>
        )
    }
}
