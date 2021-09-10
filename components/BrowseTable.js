import Loading from 'components/Loading.js';
import React from 'react';
import { downplayGroupsThreshold, groupByAttributedRelationship, groupByFirstTag, hiddenGroupsThreshold } from 'services/groupings';
import { SectionedTable, SectionedTableCollapseHeader, SectionedTableContainer, SectionedTableHeader, SectionedTableMinorHeader, SectionedTableRows } from './SectionedTable';
import TangentAccordion from './TangentAccordion';


function BrowseTables({items}) {
    let expanded = false

    if(!items) { return <Loading/>}
    let groups = groupByAttributedRelationship(items)

    if(groups.length === 1) {
        return <SectionedTable groups={groupByFirstTag(groups[0].items)}/>
    }

    groups.sort((a, b) => a.order < b.order ? -1 : 1)

    let minorGroups = [], majorGroups = []
    groups.forEach((group) => {
        if(Number.isInteger(group.order)) {
            if(group.order < downplayGroupsThreshold) { majorGroups.push(group) }
            else if(group.order < hiddenGroupsThreshold) { minorGroups.push(group) }
        }
    })
    
    if(majorGroups.length === 0 && minorGroups.length > 0) { expanded = true }

    return <>
        <SectionedTableContainer>
            {majorGroups.map(group => <React.Fragment key={group.name}>
                    <SectionedTableHeader title={group.name} />
                    <SectionedTableRows groups={groupByFirstTag(group.items)} />
                </React.Fragment>)}
            { minorGroups.length > 0 && minorGroups.map(group => <React.Fragment key={group.name}>
                        <SectionedTableMinorHeader title={group.name} />
                        <SectionedTableRows groups={groupByFirstTag(group.items)} />
                    </React.Fragment>)
            }
        </SectionedTableContainer>
        </>

}

export function InstrumentBrowseTable(props) {
    return <BrowseTables type="Instruments" {...props}/>
}
