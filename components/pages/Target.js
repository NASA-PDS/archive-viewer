import { getDatasetsForTarget, getRelatedTargetsForTarget, getSpacecraftForTarget } from 'api/target';
import { SpacecraftBrowseTable } from 'components/BrowseTable';
import { Menu } from 'components/ContextObjects';
import Description from 'components/Description';
import HTMLBox from 'components/HTMLBox';
import { DatasetListBox, groupType, RelatedTargetListBox } from 'components/ListBox';
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import RelatedTools from 'components/RelatedTools';
import { TargetTagList } from 'components/TagList';
import React, { useEffect, useState } from 'react';

export default function Target({target, lidvid}) {
    const [datasets, setDatasets] = useState(null)
    const [spacecraft, setSpacecraft] = useState(null)
    const [relatedTargets, setRelatedTargets] = useState(null)

    useEffect(() => {
        getDatasetsForTarget(target).then(setDatasets, er => console.error(er))
        getSpacecraftForTarget(target).then(setSpacecraft, er => console.error(er))
        getRelatedTargetsForTarget(target).then(setRelatedTargets, er => console.error(er))

        return function cleanup() {
            setDatasets(null)
            setSpacecraft(null)
            setRelatedTargets(null)
        }
    }, [lidvid])

    return (
        <>
            <Menu/>
            <PrimaryLayout primary={
                <>
                <TargetTagList tags={target.tags} />
                <Description model={target} />
                <HTMLBox markup={target.html1} />
                <RelatedTools tools={target.tools}/>
                <SpacecraftBrowseTable items={spacecraft} />
                <DatasetListBox items={datasets} groupBy={groupType.spacecraft} groupInfo={spacecraft}/>
                <HTMLBox markup={target.html2} />
                </>
            } secondary = {
                <PDS3Results name={target.display_name ? target.display_name : target.title}/>
            } navigational = {
                relatedTargets && relatedTargets.length > 0 && <RelatedTargetListBox items={relatedTargets} hideHeader/>
            }/>
        </>
    )
}