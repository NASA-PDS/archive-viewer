import { useRouter } from 'next/router'

const model = {
    tags: ['Asteroid', 'Spectra', 'Physical Properties'],
    tools: [{
        "name": 
            "Small Bodies Image Browser"
        ,
        "display_name": 
            "SBIB"
        ,
        "image_url": 
            "https://imgur.com/QoVMZ8X.png"
        ,
        "url": 
            "https://sbib.psi.edu/"
        ,
        "toolId": 
            1
        
    },
    {
        "name": 
            "Planetary Image Locator Tool"
        ,
        "display_name": 
            "Pilot"
        ,
        "image_url": 
            "https://imgur.com/kC2V7Zu.png"
        ,
        "url": 
            "https://pilot.wr.usgs.gov/"
        ,
        "toolId": 
            2
    },
    {
        "name": 
            "PDS Image Atlas"
        ,
        "display_name": 
            "Atlas"
        ,
        "image_url": 
            "https://imgur.com/eTfffpH.png"
        ,
        "url": 
            "https://pds-imaging.jpl.nasa.gov/search/"
        ,
        "toolId": 
            3
    },
    {
        "name": 
            "Analyst's Notebook"
        ,
        "display_name": 
            "AN"
        ,
        "image_url": 
            "https://imgur.com/AFGucMG.png"
        ,
        "url": 
            "http://an.rsl.wustl.edu/"
        ,
        "toolId": 
            4
    },
    {
        "name": 
            "Outer Planets Unified Search"
        ,
        "display_name": 
            "OPUS"
        ,
        "image_url": 
            "https://imgur.com/ilybH6C.png"
        ,
        "url": 
            "https://pds-rings.seti.org/search/"
        ,
        "toolId": 
            5
    },
    {
        "name": 
            "Orbital Data Explorer"
        ,
        "display_name": 
            "ODE"
        ,
        "image_url": 
            "https://imgur.com/o3MAjc4.png"
        ,
        "url": 
            "https://ode.rsl.wustl.edu/"
        ,
        "toolId": 
            6
    }],
    doi: '10.17882/7',
    localMeanSolar: 'N/A',
    localTrueSolar: 'N/A',
    solarLongitude: 'N/A',
    superseded_data: [{
            name: 'V1: 2017',
            browse_url: 'http://example.com'
        },{
            name: 'V2: 2019',
            browse_url: 'http://example.com'
        }],
    legacy_dois: [{
            date: '2017',
            doi: '10.13481/2'
        },{
            date: '2019',
            doi: '10.13352/8'
        }],
    pds3_version_url: 'http://example.com'
}

export function stitchDatasetWithMockData(dataset) {
    for(const key in model) {
        if(!dataset[key]) dataset[key] = model[key]
    }
}