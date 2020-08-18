import React from 'react';
import 'css/ContextObjects.scss'
import {getDatasetsForTarget, getSpacecraftForTarget, getRelatedTargetsForTarget} from 'api/target'
import {TargetHeader, TargetDescription, Menu} from 'components/ContextObjects'
import {RelatedTargetListBox, DatasetListBox, groupType} from 'components/ListBox'
import {SpacecraftBrowseTable} from 'components/BrowseTable'
import Loading from 'components/Loading'
import {TargetTagList} from 'components/TagList'
import HTMLBox from 'components/HTMLBox'
import RelatedTools from 'components/RelatedTools'
import PDS3Results from 'components/PDS3Results'
import { Container, Box } from '@material-ui/core'

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
                <TargetHeader model={target} />
                <Menu/>
                <aside className="main-aside sidebox">
                    <RelatedTargetListBox items={relatedTargets} />
                </aside>
                <Container maxWidth="lg" className="co-content">
                    <TargetTagList tags={target.tags} />
                    <TargetDescription model={target} />
                    <HTMLBox markup={target.html1} />
                    <Box mb={3}><RelatedTools tools={target.tools}/></Box>
                    <SpacecraftBrowseTable items={spacecraft} />
                    <DatasetListBox items={datasets} groupBy={groupType.spacecraft} groupInfo={spacecraft}/>
                    <PDS3Results name={target.display_name ? target.display_name : target.title}/>
                    <HTMLBox markup={target.html2} />
                </Container>
            </div>
        )
    }
}
