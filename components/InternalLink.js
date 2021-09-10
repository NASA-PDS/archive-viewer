import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

const InternalLink = React.forwardRef((props, ref) => {
    const {identifier, children, additionalPath, includeTag, ...otherProps} = props

    // build url
    const { pdsOnly, mockup } = useRouter().query
    let url = `/${identifier}${additionalPath ? '/' + additionalPath : ''}`
    let params = []
    if(pdsOnly === 'true') params.push("pdsOnly=true")
    if(mockup === 'true') params.push("mockup=true")
    url += params.length > 0 ? `?${params.join('&')}` : ''

    // wrap children in a tag if necessary
    if(!!includeTag) {
        return <Link href={url}><a {...otherProps}>{children}</a></Link>
    } else {
        return <Link href={url} {...otherProps}>{children}</Link>
    }
})


export default InternalLink