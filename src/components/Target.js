import React from 'react';

export default function Target({target}) {
    return (
        <div>
            <Header model={target} />
            <Description model={target} />

        </div>
    )
}

function Header({model}) {
    const {display_name, title, image_url} = model
    const name = display_name ? display_name : title
    return (
        <div className="target-header">
            <img src={image_url} />
            <h1> { name } Data Archive </h1>
        </div>
    )
}

function Description({model}) {
    const {display_description, target_description} = model
    const description = display_description ? display_description : target_description
    return <h3 itemProp="description" className="resource-description">{ description }</h3>
}
