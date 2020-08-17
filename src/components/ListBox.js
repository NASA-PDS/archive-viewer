import React from 'react';
import 'css/ListBox.scss'
import Loading from 'components/Loading.js'
import { groupByAttributedRelationship, groupByFirstTag, groupByRelatedItems, downplayGroupsThreshold, hiddenGroupsThreshold } from 'services/groupings'
import { ContextLink, ContextList } from 'components/ContextLinks'

/* ------ Constants ------ */
const listTypes = {
    dataset: 'dataset',
    mission: 'mission',
    target: 'target',
    relatedTarget: 'relatedTarget',
    instrument: 'instrument',
    spacecraft: 'spacecraft'
}
const listTypeValues = {
    [listTypes.dataset]: {
        title: 'Datasets',
        titleSingular: 'Dataset'
    },
    [listTypes.mission]: {
        title: 'Missions',
        titleSingular: 'Mission',
        fieldName: 'investigation_ref'
    },
    [listTypes.target]: {
        title: 'Targets',
        titleSingular: 'Target',
        fieldName: 'target_ref'
    },
    [listTypes.relatedTarget]: {
        title: 'Related Targets',
        titleSingular: 'Related Target',
        fieldName: 'target_ref'
    },
    [listTypes.instrument]: {
        title: 'Instruments',
        titleSingular: 'Instrument',
        fieldName: 'instrument_ref'
    },
    [listTypes.spacecraft]: {
        title: 'Spacecraft',
        titleSingular: 'Spacecraft',
        fieldName: 'instrument_host_ref'
    }
}



/* ------ Main Export Classes ------ */

class ListBox extends React.Component {

    static groupType = listTypes

    constructor(props, type) {
        super(props)

        // Set minimum list length for displaying a list
        const min = 25
        this.state = {
            type,
            showAll: props.items ? props.items.length <= min : false
        }
    }

    itemCount = () => {
        return this.props.items.length
    }

    makeList = () => {
        const {items, groupBy, groupInfo} = this.props
        const {type} = this.state
        const groupByField = groupBy ? listTypeValues[groupBy].fieldName : null
        return items.length === 1
        ? <ItemLink item={items[0]} single={true}/> 
        : <GroupedList groups={this.createGroupings(items, groupInfo, groupByField)} type={type}/>
    }

    createGroupings = groupByAttributedRelationship
    
    render() {
        const {items} = this.props
        const {type} = this.state

        if(!items) {
            return <Loading/>
        } else if(this.itemCount() === 0) {
            return <NoItems type={type}/>
        } else {
            const singular = items.length === 1
            return (
                <div className="list-box">
                    
                    <span className="title-box">
                        <h2 className="title">{ singular ? listTypeValues[type].titleSingular : listTypeValues[type].title }</h2>
                        { !singular && <h3 className="count">({ this.itemCount() })</h3> }
                    </span>
                    
                    {   
                        this.makeList()
                    }
                    
                </div>
            )
        } 
    }
}

class DatasetListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.dataset)
    }

    createGroupings = groupByRelatedItems
}
class MissionListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.mission)
    }
}
class TargetListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.target)
    }
}
class RelatedTargetListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.relatedTarget)
    }

    makeList = () => {
        const {items} = this.props
        return <RelatedTargetsListBox targets={items} />
    }
}
class InstrumentListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.instrument)
    }
}
class SpacecraftListBox extends ListBox {
    constructor(props) {
        super(props, listTypes.spacecraft)
    }
}

export {DatasetListBox, MissionListBox, TargetListBox, RelatedTargetListBox, InstrumentListBox, SpacecraftListBox}




/* ------ Internal Components ------ */

function GroupedList({groups, type}) {
    if (groups.length === 1) {
        return <ContextList items={groups[0].items} />
    }
    let sortedGroups = groups.sort((a, b) => a.order < b.order ? -1 : 1)
    return sortedGroups.filter(group => Number.isInteger(group.order) ? group.order < hiddenGroupsThreshold : true).map((group, index) => 
        <GroupBox group={group} type={type} minor={Number.isInteger(group.order) ? group.order >= downplayGroupsThreshold : false} key={group.name} />
    )
}

class GroupBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showGroup: !props.minor,
            showToggle: props.minor
        }
    }

    toggleList = event => {
        event.preventDefault();
        this.setState({ showGroup: !this.state.showGroup });
    }

    render() {
        let items = this.props.group.items, title = this.props.group.name
        let {showToggle, showGroup} = this.state

        if(!items.length) {
            return <NoItems type={this.props.type} descriptor={title} />
        }
        return (
            <div>
                {showToggle 
                    ?<div onClick={ this.toggleList } className="expandable">
                        <img alt="" src={ this.state.showGroup ? `images/collapse.svg` : `images/expand.svg` } className={ this.state.showGroup ? 'collapse' : 'expand' } />
                        <h3>{ title }</h3>
                    </div>
                    : <div><h3>{title}</h3></div>
                }
                
                {showGroup
                    ? <ContextList items={items} />
                    : null}
            </div>
        )
    }
}



function RelatedTargetsListBox({targets}) {
    let groups = groupByFirstTag(targets)

    return !groups.length 
        ? <NoItems type={listTypes.relatedTarget}/> 
        : <GroupedList groups={groups} type={listTypes.target}/>
}

function NoItems({type, descriptor}) {
    return (
        <div className="no-items">
            <p>No {descriptor} {listTypeValues[type].title}</p>
        </div>
    )
}