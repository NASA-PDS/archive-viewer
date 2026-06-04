import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

const InternalLink = React.forwardRef((props, ref) => {
    const {identifier, children, additionalPath, href, contextHint, targetHint, preserveContext = true, ...otherProps} = props

    // build url
    const query = useRouter().query
    const { pdsOnly, mockup } = query
    let url = `/${identifier}${additionalPath ? '/' + additionalPath : ''}`
    let params = new URLSearchParams()
    if(pdsOnly === 'true') params.set("pdsOnly", "true")
    if(mockup === 'true') params.set("mockup", "true")
    if(contextHint || (preserveContext && query.context)) params.set("context", contextHint || query.context)
    if(targetHint || (preserveContext && query.target)) params.set("target", targetHint || query.target)
    const queryString = params.toString()
    url += queryString ? `?${queryString}` : ''

    // wrap children in a tag if necessary
    // if(!!includeTag) {
    //     return <Link href={url}><a {...otherProps}>{children}</a></Link>
    // } else {
        return <Link href={url} {...otherProps} color='inherit'>{children}</Link>
    // }
})


export default InternalLink
