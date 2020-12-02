import React, { useEffect, useState } from 'react';
import TagSearch from 'components/TagSearch.js'

function ProductPage({tags, type}) {
    return <TagSearch tags={tags} type={type} />
}

export default ProductPage

export async function getServerSideProps({params}) {
    const [type, ...tags] = params.tag
    return { props: { tags: tags || null, type: type || null }}
}
