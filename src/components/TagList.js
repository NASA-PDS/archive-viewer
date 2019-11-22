import React from 'react';
import {TagTypes} from 'components/TagSearch.js'


function TagList({tags, type}) {
    if(!tags || tags.length === 0) return null

    return (
        <div id="taxonomy">
            <h3>Relevant Tags: </h3>
            {tags.map(tag => 
                <div className="banner" key={tag}>
                    <a className="ignore-a-styling" href={`/?tag=${tag}&type=${type}`}>
                        <span>{tag}</span>
                    </a>
                </div>
            )}
        </div>
    )
}

export function TargetTagList({tags}) {
    return <TagList tags={tags} type={TagTypes.target} />
}
export function SpacecraftTagList({tags}) {
    return <TagList tags={tags} type={TagTypes.spacecraft} />
}
export function MissionTagList({tags}) {
    return <TagList tags={tags} type={TagTypes.mission} />
}
export function InstrumentTagList({tags}) {
    return <TagList tags={tags} type={TagTypes.instrument} />
}
export function DatasetTagList({tags}) {
    return <TagList tags={tags} type={TagTypes.dataset} />
}