import React from 'react';
import 'css/BrowseTable.scss'
import Loading from 'components/Loading.js'
import { Link } from 'react-router-dom'

/* ------ Constants ------ */
const downplayGroupsThreshold = 100
const hiddenGroupsThreshold = 1000
const miscGroup = 'Other'

class BrowseTables extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expanded: false
        }
    }

    toggleExpanded = event => {
        event.preventDefault();
        this.setState({ expanded: !this.state.expanded });
    }

    render() {
        const {items} = this.props

        if(!items) { return <Loading/>}
        let groups = groupByAttributedRelationship(items)
        groups.sort((a, b) => a.order < b.order ? -1 : 1)

        let minorGroups = [], majorGroups = []
        groups.forEach((group) => {
            if(Number.isInteger(group.order)) {
                if(group.order < downplayGroupsThreshold) { majorGroups.push(group) }
                else if(group.order < hiddenGroupsThreshold) { minorGroups.push(group) }
            }
        })

        const expanded = this.state.expanded || (majorGroups.length === 0 && minorGroups.length > 0)
        return (
            <div className="browse-tables">
                {majorGroups.map(group => { return (
                    <div key={group.name} className="major">
                        <h2 className="browse-group-title">{group.name} {group.order < downplayGroupsThreshold ? this.type : ''}</h2>
                        { this.sectioned ? <SectionedTable items={group.items} query={this.query} /> : <List items={group.items} query={this.query} /> }
                    </div>
                )})}
                {expanded === false && minorGroups.length > 0 && 
                    <div className="browse-expand" onClick={this.toggleExpanded}>See more</div>
                }
                {expanded && minorGroups.map(group => { return (
                    <div key={group.name} className="minor">
                        <h2 className="browse-group-title">{group.name} {group.order < downplayGroupsThreshold ? this.type : ''}</h2>
                        { this.sectioned ? <SectionedTable items={group.items} query={this.query} /> : <List items={group.items} query={this.query} /> }
                    </div>
                )})}
            </div>
        )
    }

}

export class SpacecraftBrowseTable extends BrowseTables {
    query = 'spacecraft'
    type = 'Spacecraft'
    sectioned = false
}
export class InstrumentBrowseTable extends BrowseTables {
    query = 'instrument'
    type = 'Instruments'
    sectioned = true
}
function SectionedTable({items, query}) {
    let groups = groupByFirstTag(items)
    groups.sort((a, b) => a.order.localeCompare(b.order))
    return (
        <div className="browse-table">
            {groups.map(group => { return (
                <div className="browse-row" key={group.name}>
                    {(groups.length > 1 || group.name !== miscGroup) &&
                        <div className="browse-col headers"> { group.name }</div>
                    }
                    <div className="browse-col">
                        <List items={group.items} query={query} />
                    </div>
                </div>
            )})}
        </div>
    )
}


class Group {
    constructor(name, items, order) {
        this.name = name
        this.items = items
        this.order = order !== undefined ? order : name
    }
}

function nameFinder(item) {
    return item.display_name ? item.display_name : item.title
}

function List({items, query}) {    
    if(!items || !items.length) { return <NoItems/>}
    let sortedItems = items.sort((a, b) => {
        return nameFinder(a).localeCompare(nameFinder(b))
    })
    return (
        <ul className="list">
            {sortedItems.map((item,idx) => 
                <li key={item.identifier + idx}><ItemLink item={item} query={query} single={false}/></li>
            )}
        </ul>
    )
}

function ItemLink({item, query, single}) {
    let url = `/${query}/${item.identifier}`
    return (
        <Link to={url} className={single ? 'single-item' : ''}>
            <span className="list-item-name">{ nameFinder(item) }</span>
        </Link>
    )
}

function NoItems() {
    return (
        <div className="no-items">
            <p>None of this type</p>
        </div>
    )
}

const groupByAttributedRelationship = (items, relationshipInfo) => {
    let insert = (item, groupName, order) => {
        let existingGroup = groups.find(group => group.name === groupName)
        if (!!existingGroup) {existingGroup.items.push(item)}
        else groups.push(new Group(groupName, [item], order))
    }
    let groups = []

    // first insert any mandatory groups
    if(!!relationshipInfo) {
        for(let relationship of relationshipInfo) {
            if (relationship.order !== undefined && relationship.order < downplayGroupsThreshold) {
                groups.push(new Group(relationship.name, [], relationship.order))
            }
        }
    }
    for (let item of items) {

        // if possible, group by relationships already in data
        const relationship = item.relatedBy
        if(!!relationship) { insert(item, relationship.name, relationship.order) }
        else { insert(item, miscGroup, 999) }
        
    }
    return groups
}

const groupByFirstTag = (items) => {
    let insert = (item, groupName, order) => {
        let existingGroup = groups.find(group => group.name === groupName)
        if (!!existingGroup) {existingGroup.items.push(item)}
        else groups.push(new Group(groupName, [item], order))
    }
    let groups = []
    for (let item of items) {
        if(!item.tags || !item.tags.length) {
            insert(item, miscGroup, 'zzzzz')
        }
        else {
            insert(item, item.tags[0])
        }
    }
    return groups
}