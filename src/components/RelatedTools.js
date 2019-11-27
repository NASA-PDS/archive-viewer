import React from 'react';

export default function RelatedTools({tools}){
    if(!tools) { return null }
    return (
        <div>
        <h2>Useful tool{tools.length > 1 ? 's' : ''} for this data:</h2>
        <ul className="related-tools" >
            {tools.map(tool => (
                <li key={tool.toolId}><ToolLink tool={tool}/></li>
            ))}
        </ul>
        </div>
    )
}

function ToolLink({tool}) {
    return (
        <a className="related-tool" href={tool.url}>
            <img alt={'Icon for ' + tool.display_name} src={tool.image_url} />
            <div className="tool-names">
                <span className="tool-shortname">{tool.display_name}</span>
                <span className="tool-longname">{tool.name}</span>
            </div>
        </a>
    )
}