import React from 'react';
import 'css/ContextObjects.scss'
import {getDatasetsForTarget, getSpacecraftForTarget, getRelatedTargetsForTarget} from 'api/target'
import {Header, Description} from 'components/ContextObjects'
import {DatasetListBox,SpacecraftListBox,RelatedTargetsListBox} from 'components/ListBox'
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
        getDatasetsForTarget(this.state.target).then(datasets => this.setState({datasets}))
        getSpacecraftForTarget(this.state.target).then(spacecraft => this.setState({spacecraft}))
        getRelatedTargetsForTarget(this.state.target).then(relatedTargets => this.setState({relatedTargets}))
    }

    render() {
        const {target,relatedTargets,datasets,spacecraft} = this.state
        if (!target || relatedTargets === null || datasets === null || spacecraft === null) return <Loading />
        else return (
            <div>
                <Header model={target} type={Header.type.target} />
                <main className="co-main target-main">
                    <Description model={target} type={Description.type.target} />
                    <DatasetListBox items={datasets} groupBy="spacecraft" groupInfo={spacecraft}/>
                </main>
                <aside className="sidebox">
                    <SpacecraftListBox items={spacecraft} />
                    <RelatedTargetsListBox relatedTargets={relatedTargets} />
                </aside>
            </div>
        )
    }
}
