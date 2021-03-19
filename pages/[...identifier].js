import React from 'react';
import { Bundle, Collection, PDS3Dataset } from 'components/pages/Dataset.js'
import Loading from 'components/Loading'
import ErrorMessage from 'components/Error.js'
import FrontPage from 'pages/index'
import { initialLookup } from 'api/common'
import { resolveType, types } from 'services/pages.js'
import MissionContext from 'components/contexts/MissionContext';
import TargetContext from 'components/contexts/TargetContext';
import { Helmet } from 'react-helmet'

function ProductPageContent({error, loaded, model, type, ...otherProps}) {

    if(error) {
        return <ErrorMessage error={error} />
    } else if (!loaded) {
        return <Loading fullscreen={true} />
    } else {
        switch(type) {
            case types.BUNDLE: return <Bundle dataset={model} {...otherProps}/>
            case types.COLLECTION: return <Collection dataset={model} {...otherProps}/>
            case types.PDS3: return <PDS3Dataset dataset={model} {...otherProps}/>
            case types.TARGET: return <TargetContext model={model} {...otherProps}/>
            case types.INSTRUMENT: 
            case types.SPACECRAFT:
            case types.MISSION: return <MissionContext type={type} model={model} {...otherProps}/>
            default: return <FrontPage />
        }
    }
}

function ProductPage(props) {
    const {error, model, pdsOnly} = props
    if(!error) {

        const {display_name, title} = model
        const pageTitle = (display_name && !pdsOnly ? display_name : title) + ' - NASA Planetary Data System'

        return <>
            <PageMetadata pageTitle={pageTitle}/>
            <ProductPageContent {...props} />
        </>
    } else {
        return <ErrorMessage error={error} />
    }
}

function PageMetadata({pageTitle}) {
    return <Helmet>
        <title>{ pageTitle }</title>
        <meta charSet="utf-8" />
    </Helmet>
}

export default ProductPage

export async function getServerSideProps({params, query}) {
    const [lidvid, ...extraPath] = params.identifier
    let props = { lidvid, extraPath };
    
    if(query.pdsOnly === 'true') { props.pdsOnly = true }
    if(query.mockup === 'true') { props.mockup = true }

    try {
        const result = await initialLookup(lidvid, !!params.pdsOnly)
        props.loaded = true
        const type = resolveType(result)

        if(result.length === 0) {
            props.error = `No ${type} found for lidvid ${lidvid}`
        } else if(result.length > 1) {
            props.error = `More than one ${type} found for lidvid ${lidvid}`
        } else {
            props.type = type
            props.model = result
        }
    } catch(err) {
        props.error = err instanceof Error ? err.message : err
    }

    return { props }

}
