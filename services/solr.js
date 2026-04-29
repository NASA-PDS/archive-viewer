const defaultSolrBaseUrl = 'https://sbnpds4.psi.edu/solr'

export function getSolrBaseUrl() {
    return (process.env.SUPPLEMENTAL_SOLR || process.env.NEXT_PUBLIC_SUPPLEMENTAL_SOLR || defaultSolrBaseUrl).replace(/\/+$/, '')
}

export function getCoreSelectUrl() {
    return `${getSolrBaseUrl()}/pds-alias/select`
}

export function getWebCollectionSelectUrl(collection) {
    return `${getSolrBaseUrl()}/${collection}/select`
}
