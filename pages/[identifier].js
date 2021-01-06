import React from 'react';
import { Bundle, Collection, PDS3Dataset } from 'components/pages/Dataset.js'
import Target from 'components/pages/Target.js'
import Mission from 'components/pages/Mission.js'
import Spacecraft from 'components/pages/Spacecraft.js'
import Instrument from 'components/pages/Instrument.js'
import Loading from 'components/Loading'
import ErrorMessage from 'components/Error.js'
import FrontPage from 'pages/index'
import { initialLookup } from 'api/common'
import { resolveType, types } from 'services/pages.js'

function ProductPage({error, loaded, model, type, lidvid, pdsOnly, mockup}) {

    if(error) {
        return <ErrorMessage error={error} />
    } else if (!loaded) {
        return <Loading fullscreen={true} />
    } else if (type === types.BUNDLE) {
        return <Bundle lidvid={lidvid} dataset={model} pdsOnly={pdsOnly} mockup={mockup}/>
    } else if (type === types.COLLECTION) {
        return <Collection lidvid={lidvid} dataset={model} pdsOnly={pdsOnly} mockup={mockup} />
    } else if (type === types.PDS3) {
        return <PDS3Dataset lidvid={lidvid} dataset={model} pdsOnly={pdsOnly} mockup={mockup} />
    } else if (type === types.TARGET) {
        return <Target lidvid={lidvid} target={model} pdsOnly={pdsOnly} mockup={mockup}  />
    } else if (type === types.INSTRUMENT) {
        return <Instrument lidvid={lidvid} instrument={model} pdsOnly={pdsOnly} mockup={mockup}  />
    } else if (type === types.MISSION) {
        return <Mission lidvid={lidvid} mission={model} pdsOnly={pdsOnly} mockup={mockup}  />
    } else if (type === types.SPACECRAFT) {
        return <Spacecraft lidvid={lidvid} spacecraft={model} pdsOnly={pdsOnly} mockup={mockup} />
    } else {
        return <FrontPage />
    }
}

export default ProductPage

export async function getServerSideProps({params, query}) {
    let lidvid = params.identifier
    let props = { lidvid };
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
