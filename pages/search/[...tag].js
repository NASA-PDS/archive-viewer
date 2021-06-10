import React from 'react';
import TagSearch from 'components/TagSearch.js'
import { setTheme } from 'services/pages';
import GlobalContext from 'components/contexts/GlobalContext';
import Themed from 'components/Themed';

function ProductPage(props) {
    const {tags, type} = props
    return <Themed {...props}>
        <GlobalContext>
            <TagSearch tags={tags} type={type} />
        </GlobalContext>
    </Themed>
}

export default ProductPage

export async function getServerSideProps(context) {
    const {params} = context
    const [type, ...tags] = params.tag
    let props = { tags: tags || null, type: type || null }
    setTheme(props, context)
    return { props }
}
