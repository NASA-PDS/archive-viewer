import React from 'react';
import 'css/ContextObjects.scss'
import {getMissionsForSpacecraft, getTargetsForSpacecraft, getInstrumentsForSpacecraft, getDatasetsForSpacecraft} from 'api/spacecraft.js'
import {TargetListBox, InstrumentListBox, DatasetListBox} from 'components/ListBox'
import {InstrumentBrowseTable} from 'components/BrowseTable'
import {Header, Description, Menu} from 'components/ContextObjects'
import Loading from 'components/Loading'
import {SpacecraftTagList} from 'components/TagList'
import HTMLBox from 'components/HTMLBox'
import RelatedTools from 'components/RelatedTools'
import PDS3Results from 'components/PDS3Results'
import {instrumentSpacecraftRelationshipTypes, targetSpacecraftRelationshipTypes} from 'api/relationships'
import { Link } from 'react-router-dom'

export default class Spacecraft extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            spacecraft: props.spacecraft,
            mission: null,
            missions: null,
            instruments: null,
            targets: null,
            datasets: null,
            loaded: false,
        }
    }

    componentDidMount() {
        getMissionsForSpacecraft(this.state.spacecraft).then(missions => this.setState({mission: (missions && missions.length > 0) ? missions[0] : null}), er => console.log(er))
        getTargetsForSpacecraft(this.state.spacecraft).then(targets => this.setState({targets}), er => console.log(er))
        getInstrumentsForSpacecraft(this.state.spacecraft).then(instruments => this.setState({instruments}), er => console.log(er))
        getDatasetsForSpacecraft(this.state.spacecraft).then(datasets => this.setState({datasets}), er => console.log(er))
    }

    render() {
        const {spacecraft,mission} = this.state
        if (!spacecraft || mission === null) return <Loading fullscreen={true}/>
        else {
            return (
                <div className="co-main">
                    <Header model={mission} type={Header.type.mission} />
                    <Menu/>
                    <aside className="main-aside sidebox">
                        {mission && mission.instrument_host_ref && mission.instrument_host_ref.length > 1 &&
                            <Link to={`/mission/${mission.identifier}`}><div className="button">Visit Mission Page</div></Link>
                        }
                        <TargetListBox items={this.state.targets} groupInfo={targetSpacecraftRelationshipTypes}/>
                    </aside>
                    <div className="co-content">
                        <SpacecraftTagList tags={spacecraft.tags} />
                        <Description model={mission} type={Description.type.mission} />
                        {mission.instrument_host_ref && mission.instrument_host_ref.length > 1 &&
                            <Header model={spacecraft} type={Header.type.spacecraft}/>
                        }
                        <HTMLBox markup={spacecraft.html1} />
                        <RelatedTools tools={spacecraft.tools}/>
                        <InstrumentBrowseTable items={this.state.instruments} />
                        <DatasetListBox items={this.state.datasets} groupBy={DatasetListBox.groupType.instrument} groupInfo={this.state.instruments} />
                        <PDS3Results name={spacecraft.display_name ? spacecraft.display_name : spacecraft.title}/>
                        <HTMLBox markup={spacecraft.html2} />
                    </div>
                </div>
            )
        }
    }
}
