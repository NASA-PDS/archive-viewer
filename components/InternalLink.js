import Link from 'next/link'
import { useRouter } from 'next/router'

export default function InternalLink({identifier, component, children, ...otherProps}) {
    const { pdsOnly, mockup } = useRouter().query
    let url = `/${identifier}`
    let params = []
    if(pdsOnly === 'true') params.push("pdsOnly=true")
    if(mockup === 'true') params.push("mockup=true")
    url += params.length > 0 ? `?${params.join('&')}` : ''
    return <Link href={url} {...otherProps}>{children}</Link>
}