import LID from 'services/LogicalIdentifier'

class Group {
    constructor(name, items, order) {
        this.name = name
        this.items = items
        this.order = order !== undefined ? order : name
    }
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
        else { insert(item, miscGroupName, 999) }
        
    }
    return groups
}

const groupByRelatedItems = (items, relatedItems, field) => {
    let insert = (item, groupName, order) => {
        let existingGroup = groups.find(group => group.name === groupName)
        if (!!existingGroup) {existingGroup.items.push(item)}
        else groups.push(new Group(groupName, [item], order))
    }
    let groups = []
    for (let item of items) {
        if(!field || !item[field] || !item[field].length) {
            insert(item, 'Other', 999)
        }
        else {
            const lids = item[field]
            // an item might appear in many groups simultaneously. add it to each group it references
            lids.forEach(lidvid => {
                let host_name
                const lid = new LID(lidvid).lid
                const groupInfoSource = relatedItems ? relatedItems.find(a => a.identifier === lid) : null
                
                if (groupInfoSource) host_name = groupInfoSource.display_name ? groupInfoSource.display_name : groupInfoSource.title
                else host_name = lid
                
                insert(item, host_name)
            })
        }
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
            insert(item, miscGroupName, 'zzzzz')
        }
        else {
            insert(item, item.tags[0])
        }
    }
    return groups
}

const downplayGroupsThreshold = 100
const hiddenGroupsThreshold = 1000
const miscGroupName = 'Other'

export { Group, groupByAttributedRelationship, groupByFirstTag, groupByRelatedItems, downplayGroupsThreshold, hiddenGroupsThreshold, miscGroupName}